import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { IFirebaseAdminService } from './interfaces/firebase-admin.service.interface';

@Injectable()
export class FirebaseAdminService
  implements OnModuleInit, IFirebaseAdminService
{
  async onModuleInit() {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: 'caterflow-df55f',
    });
  }

  async verifyToken(token: string) {
    const decodedToken = await admin
      .auth()
      .verifyIdToken(token)
      .catch((reason) => {
        // Need to figure out how to exclude expected errors
        // Sentry.captureException(reason);
        throw reason;
      });
    console.log(decodedToken);
    return decodedToken;
  }
}
