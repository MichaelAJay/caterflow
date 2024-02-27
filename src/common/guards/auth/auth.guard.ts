import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ERROR_CODE } from '../../codes/error-codes';
import { bypassAccountRequirementMetadataName } from '../../decorators/bypass-account-requirement.decorator';
import { isPublicMetadataName } from '../../decorators/public.decorator';
import { FirebaseAdminService } from '../../../external-modules/firebase-admin/firebase-admin.service';
import { UserService } from '../../../internal-modules/user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly firebaseAdminService: FirebaseAdminService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const isPublic = this.reflector.getAllAndOverride<boolean>(
        isPublicMetadataName,
        [context.getHandler(), context.getClass()],
      );
      if (isPublic) return true;

      const request = context.switchToHttp().getRequest();
      const token = request.headers.authorization?.split(' ')[1];
      if (!token) return false;

      const payload = await this.firebaseAdminService.verifyToken(token);
      if (payload.email_verified !== true) {
        // Some sort of special error case
        throw new ForbiddenException({
          message:
            'Your email address has not been verified. Please verify your email to continue.',
          code: ERROR_CODE.UnverifiedEmail,
        });
      }

      // User exists?
      const user = await this.userService.getUserByExternalUID(payload.uid);
      // This actually represents a problem
      if (user === null) return false;

      // User isn't associated with account
      if (user.accountId === null) {
        const canSkipAccountCheck = this.reflector.getAllAndOverride<boolean>(
          bypassAccountRequirementMetadataName,
          [context.getHandler(), context.getClass()],
        );
        if (!canSkipAccountCheck) {
          throw new ForbiddenException({
            message:
              'This request may only be made by a user associated with an account',
            code: ERROR_CODE.NoAccount,
          });
        }
      }

      request.user = {
        id: user.id,
        external_auth_uid: payload.uid,
        email: payload.email,
        accountId: user ? user.accountId : undefined,
      };

      return true;
    } catch (error) {
      // Specific errors to allow request lifecycle to address
      if (error instanceof ForbiddenException) {
        throw error;
      }

      if (error.code && error.code === 'auth/id-token-expired') {
        throw new UnauthorizedException({
          message: 'The access token is expired. Please login again.',
          code: ERROR_CODE.TokenExpired,
        });
      }

      console.error('Unhandled auth guard error', error);
      return false;
    }
  }
}
