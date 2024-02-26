import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { FirebaseAdminService } from '../../../external-modules/firebase-admin/firebase-admin.service';
import { Reflector } from '@nestjs/core';
import { UserService } from '../../../internal-modules/user/user.service';
import { mockFirebaseAdminService } from '../../../../test/mocks/providers/mock_firebase_admin';
import { mockUserService } from '../../../../test/mocks/providers/mock_user_service';

describe('AuthGuard', () => {
  let guard: AuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        { provide: FirebaseAdminService, useValue: mockFirebaseAdminService },
        { provide: Reflector, useValue: { getAllAndOverride: jest.fn() } },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });
});
