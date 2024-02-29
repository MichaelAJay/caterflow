import { Test, TestingModule } from '@nestjs/testing';
import { AccountController } from './account.controller';
import { AccountService } from '../../internal-modules/account/account.service';
import { mockAccountService } from '../../../test/mocks/providers/mock_account_service';
import { SUCCESS_CODE } from '../../common/codes/success-codes';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { FirebaseAdminService } from '../../external-modules/firebase-admin/firebase-admin.service';
import { mockFirebaseAdminService } from '../../../test/mocks/providers/mock_firebase_admin';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { validateCreateAccountRequestBody } from './validators/post.account';

describe('AccountController', () => {
  let controller: AccountController;
  let accountService: AccountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [
        { provide: AccountService, useValue: mockAccountService },
        { provide: FirebaseAdminService, useValue: mockFirebaseAdminService },
      ],
    }).compile();

    controller = module.get<AccountController>(AccountController);
    accountService = module.get<AccountService>(AccountService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createAccount', () => {
    let mockValidateCreateAccountRequestBody: jest.Mock;

    beforeEach(() => {
      mockValidateCreateAccountRequestBody = jest.fn();
      (validateCreateAccountRequestBody as jest.Mock) =
        mockValidateCreateAccountRequestBody;
    });

    it('should return a success message when the account is successfully created', async () => {
      const body = { name: 'test' };
      const req = { user: { accountId: undefined, external_auth_uid: 'abc' } };
      jest.spyOn(accountService, 'createAccount').mockResolvedValue(undefined);
      mockValidateCreateAccountRequestBody.mockReturnValue({
        valid: true,
        data: body,
      });

      const result = await controller.createAccount(body, req as any);
      expect(result).toEqual({
        message: 'Your account was successfully created!',
        code: SUCCESS_CODE.AccountCreated,
      });
    });

    it('should call accountService.createAccount with the correct arguments', async () => {
      const body = { name: 'tests' };
      const req = { user: { accountId: undefined, external_auth_uid: 'abc' } };
      const createAccountSpy = jest
        .spyOn(accountService, 'createAccount')
        .mockResolvedValue(undefined);
      mockValidateCreateAccountRequestBody.mockReturnValue({
        valid: true,
        data: body,
      });
      await controller.createAccount(body, req as any);

      expect(createAccountSpy).toHaveBeenCalledWith(
        body.name,
        req.user.external_auth_uid,
      );
    });

    it('should throw a ConflictException when the user already has an account', async () => {
      const body = { name: 'test' };
      const req = { user: { accountId: '123', external_auth_uid: 'abc' } };
      mockValidateCreateAccountRequestBody.mockReturnValue({
        valid: true,
        data: body,
      });
      await expect(controller.createAccount(body, req as any)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw an error when the request body is invalid', async () => {
      const invalidBody = { invalid: 'body' };
      const req = { user: { accountId: undefined, external_auth_uid: 'abc' } };
      mockValidateCreateAccountRequestBody.mockReturnValue({
        valid: false,
        errors: {},
      });

      await expect(
        controller.createAccount(invalidBody, req as any),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
