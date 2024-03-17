import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../../../internal-modules/user/user.service';
import {
  UserFoundLoginRequest,
  UserNotFoundLoginRequest,
} from '../../../api/interfaces/login-request.interface';
import { ERROR_CODE } from '../../../common/codes/error-codes';
import { GuardService } from '../guard/guard.service';

@Injectable()
export class LoginGuard implements CanActivate {
  constructor(
    private readonly guardService: GuardService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const payload = await this.guardService.verifyToken(request);

      const user = await this.userService.getUserByExternalUID(payload.uid);

      if (user) {
        (request as UserFoundLoginRequest).userFound = true;
        (request as UserFoundLoginRequest).userId = user.id;
        (request as UserFoundLoginRequest).userHasAccount = !!user.accountId;
        (request as UserFoundLoginRequest).requiresEmailVerificationSync =
          payload.email_verified !== user.emailVerified;
        (request as UserFoundLoginRequest).externalEmailVerificationStatus =
          payload.email_verified;
      } else {
        const { name, email, uid } = payload;
        (request as UserNotFoundLoginRequest).userFound = false;
        (request as UserNotFoundLoginRequest).user = {
          name,
          email,
          external_auth_uid: uid,
          emailVerified: !!payload.email_verified,
        };
      }
      return true;
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        const response = err.getResponse();
        if (
          typeof response === 'object' &&
          response !== null &&
          'code' in response
        ) {
          if (response.code === ERROR_CODE.MissingToken) {
            throw err;
          }
        }
      }
      if (err instanceof ForbiddenException) {
        const response = err.getResponse();
        if (
          typeof response === 'object' &&
          response !== null &&
          'code' in response
        ) {
          if (response.code === ERROR_CODE.MalformedToken) {
            throw err;
          }
        }
      }
      return false;
    }
  }
}
