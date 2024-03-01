import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { IGuardService } from './interfaces/guard.service.interface';
import { FirebaseAdminService } from '../../../external-modules/firebase-admin/firebase-admin.service';
import { ERROR_CODE } from '../../../common/codes/error-codes';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import * as Sentry from '@sentry/node';

export type VerifiedPayload = Omit<DecodedIdToken, 'email'> & {
  name: string;
  email: string;
};

@Injectable()
export class GuardService implements IGuardService {
  constructor(private readonly firebaseAdminService: FirebaseAdminService) {}

  // @TODO TEST
  // @TODO include challenge (per RFC 7235 for 401)

  async verifyToken(request: any): Promise<VerifiedPayload> {
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException({
        message: 'Missing bearer token',
        code: ERROR_CODE.MissingToken,
      });
    }
    const payload = await this.firebaseAdminService.verifyToken(token);
    if (!this.isVerifiedPayload(payload)) {
      const err = new ForbiddenException({
        message: 'Malformed token',
        code: ERROR_CODE.MalformedToken,
      });

      const extras: Record<string, unknown> = {};
      if (!('name' in payload)) {
        extras['name'] = 'undefined';
      } else if (typeof payload.name !== 'string') {
        extras['typeof_name'] = typeof payload.name;
      }

      if (!payload.email) {
        extras['email'] = 'undefined';
      }
      Sentry.withScope((scope) => {
        scope.setExtras(extras);
        Sentry.captureException(err);
      });

      throw err;
    }
    return payload;
  }

  isVerifiedPayload(payload: any): payload is VerifiedPayload {
    return (
      typeof payload === 'object' &&
      payload !== null &&
      typeof payload.name === 'string' &&
      typeof payload.email === 'string' // as opposed to undefined
    );
  }
}
