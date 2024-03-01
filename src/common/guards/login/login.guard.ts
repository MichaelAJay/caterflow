import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { FirebaseAdminService } from '../../../external-modules/firebase-admin/firebase-admin.service';
import { UserService } from '../../../internal-modules/user/user.service';
import {
  UserFoundLoginRequest,
  UserNotFoundLoginRequest,
} from '../../../api/interfaces/login-request.interface';
import * as Sentry from '@sentry/node';
import { ERROR_CODE } from '../../../common/codes/error-codes';

@Injectable()
export class LoginGuard implements CanActivate {
  constructor(
    private readonly firebaseAdminService: FirebaseAdminService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const token = request.headers.authorization?.split(' ')[1];
      if (!token) return false;

      const payload = await this.firebaseAdminService.verifyToken(token);

      const user = await this.userService.getUserByExternalUID(payload.uid);

      if (user) {
        (request as UserFoundLoginRequest).userFound = true;
        (request as UserFoundLoginRequest).userId = user.id;
        (request as UserFoundLoginRequest).userHasAccount = !!user.accountId;
        (request as UserFoundLoginRequest).requiresEmailVerificationSync =
          !!payload.email_verified && !user.emailVerified;
      } else {
        const { name, email, uid } = payload;
        if (!(typeof name === 'string' && email)) {
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
      return false;
    }
  }
}
