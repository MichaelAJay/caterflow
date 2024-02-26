import { IFirebaseAdminService } from 'src/external-modules/firebase-admin/interfaces/firebase-admin.service.interface';

export const mockFirebaseAdminService: IFirebaseAdminService = {
  verifyToken: jest.fn(),
};
