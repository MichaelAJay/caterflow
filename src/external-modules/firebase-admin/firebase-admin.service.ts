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
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      return decodedToken;
    } catch (err) {
      throw err;
    }
  }
}
