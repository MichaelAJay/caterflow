import { Test, TestingModule } from '@nestjs/testing';
import { CateringCompanyController } from './account.controller';
import { CateringCompanyService } from '../../internal-modules/account/account.service';
import { mockCateringCompanyService } from '../../../test/mocks/providers/mock_account_service';
import { SUCCESS_CODE } from '../../common/codes/success-codes';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { FirebaseAdminService } from '../../external-modules/firebase-admin/firebase-admin.service';
import { mockFirebaseAdminService } from '../../../test/mocks/providers/mock_firebase_admin';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { validateCreateCateringCompanyRequestBody } from './validators/post.account';

describe('CateringCompanyController', () => {
  let controller: CateringCompanyController;
  let cateringCompanyService: CateringCompanyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CateringCompanyController],
      providers: [
        {
          provide: CateringCompanyService,
          useValue: mockCateringCompanyService,
        },
        { provide: FirebaseAdminService, useValue: mockFirebaseAdminService },
      ],
    }).compile();

    controller = module.get<CateringCompanyController>(
      CateringCompanyController,
    );
    cateringCompanyService = module.get<CateringCompanyService>(
      CateringCompanyService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createCateringCompany', () => {
    let mockValidateCreateCateringCompanyRequestBody: jest.Mock;

    beforeEach(() => {
      mockValidateCreateCateringCompanyRequestBody = jest.fn();
      (validateCreateCateringCompanyRequestBody as jest.Mock) =
        mockValidateCreateCateringCompanyRequestBody;
    });

    it('should return a success message when the catering company is successfully created', async () => {
      const body = { name: 'test' };
      const req = { user: { accountId: null, external_auth_uid: 'abc' } };
      jest
        .spyOn(cateringCompanyService, 'createCateringCompany')
        .mockResolvedValue(undefined);
      mockValidateCreateCateringCompanyRequestBody.mockReturnValue({
        valid: true,
        data: body,
      });

      const result = await controller.createCateringCompany(body, req as any);
      expect(result).toEqual({
        message: 'Your company details were successfully added!',
        code: SUCCESS_CODE.CateringCompanyCreated,
      });
    });

    it('should call cateringCompanyService.createCateringCompany with the correct arguments', async () => {
      const body = { name: 'tests' };
      const req = { user: { accountId: null, id: 'abc' } };
      const createCateringCompanySpy = jest
        .spyOn(cateringCompanyService, 'createCateringCompany')
        .mockResolvedValue(undefined);
      mockValidateCreateCateringCompanyRequestBody.mockReturnValue({
        valid: true,
        data: body,
      });
      await controller.createCateringCompany(body, req as any);

      expect(createCateringCompanySpy).toHaveBeenCalledWith(
        body.name,
        req.user.id,
      );
    });

    it('should throw a ConflictException when the user already has an associated catering company', async () => {
      const body = { name: 'test' };
      const req = { user: { accountId: '123', external_auth_uid: 'abc' } };
      mockValidateCreateCateringCompanyRequestBody.mockReturnValue({
        valid: true,
        data: body,
      });
      await expect(
        controller.createCateringCompany(body, req as any),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw an error when the request body is invalid', async () => {
      const invalidBody = { invalid: 'body' };
      const req = { user: { accountId: undefined, external_auth_uid: 'abc' } };
      mockValidateCreateCateringCompanyRequestBody.mockReturnValue({
        valid: false,
        errors: {},
      });

      await expect(
        controller.createCateringCompany(invalidBody, req as any),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
