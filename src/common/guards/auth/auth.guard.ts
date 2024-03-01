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
import { bypassUserRequirementMetadataName } from '../../decorators/bypass-user-requirement.decorator';
import { bypassVerifiedEmailRequirementMetadataName } from '../../decorators/bypass-verified-email-requirement.decorator';
import {
  AuthenticatedRequest,
  AuthenticatedRequestForNewUser,
} from '../../../api/interfaces/authenticated-request.interface';
import * as Sentry from '@sentry/node';
import { isLogInMetadataName } from '../../../common/decorators/login.decorator';

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
      if (!payload.email) {
        const err = new ForbiddenException({
          message: 'Malformed token',
          code: ERROR_CODE.MalformedToken,
        });

        Sentry.withScope((scope) => {
          scope.setExtra('missing', 'email');
          Sentry.captureException(err);
        });

        throw err;
      }

      const isLogIn = this.reflector.getAllAndOverride<boolean>(
        isLogInMetadataName,
        [context.getHandler(), context.getClass()],
      );
      if (isLogIn) {
        return true;
      }

      if (payload.email_verified !== true) {
        const canSkipVerifiedEmailCheck =
          this.reflector.getAllAndOverride<boolean>(
            bypassVerifiedEmailRequirementMetadataName,
            [context.getHandler(), context.getClass()],
          );
        if (!canSkipVerifiedEmailCheck) {
          throw new ForbiddenException({
            message:
              'Your email address has not been verified. Please verify your email to continue.',
            code: ERROR_CODE.UnverifiedEmail,
          });
        }
      }

      // User exists?
      const user = await this.userService.getUserByExternalUID(payload.uid);
      // This actually represents a problem
      if (user === null) {
        const canSkipUserCheck = this.reflector.getAllAndOverride<boolean>(
          bypassUserRequirementMetadataName,
          [context.getHandler(), context.getClass()],
        );
        if (!canSkipUserCheck) {
          return false;
        } else {
          if (typeof payload.name !== 'string') {
            const err = new ForbiddenException({
              message: 'Malformed token',
              code: ERROR_CODE.MalformedToken,
            });

            Sentry.withScope((scope) => {
              scope.setExtra('missing', 'name');
              Sentry.captureException(err);
            });

            throw err;
          }

          (request as AuthenticatedRequestForNewUser).user = {
            name: payload.name,
            external_auth_uid: payload.uid,
            email: payload.email,
          };
          return true;
        }
      }

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

      (request as AuthenticatedRequest).user = {
        id: user.id,
        internalUserEmailVerificationStatus: user.emailVerified,
        external_auth_uid: payload.uid,
        email: payload.email,
        accountId: user.accountId,
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
      return false;
    }
  }
}
