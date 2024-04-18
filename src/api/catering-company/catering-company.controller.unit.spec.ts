import { Test, TestingModule } from '@nestjs/testing';
import { CateringCompanyController } from './catering-company.controller';
import { CateringCompanyService } from '../../internal-modules/catering-company/catering-company.service';
import { mockCateringCompanyService } from '../../../test/mocks/providers/mock_catering_company_service';
import { SUCCESS_CODE } from '../../common/codes/success-codes';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { FirebaseAdminService } from '../../external-modules/firebase-admin/firebase-admin.service';
import { mockFirebaseAdminService } from '../../../test/mocks/providers/mock_firebase_admin';
import { IBuildRetrieveCompanyIntegrationListArgs } from '../../internal-modules/external-handlers/db-handlers/catering-company-db-handler/interfaces/query-builder-args.interfaces';
import { AuthenticatedRequestForCompanyUser } from '../interfaces/authenticated-request.interface';
import { CompanyIntegrationOutputItem } from '../../common/types/company-integration-list-item.type';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { validateCreateCateringCompanyRequestBody } from './validators/post.caterer';

describe('CateringCompanyController', () => {
  let controller: CateringCompanyController;
  let cateringCompanyService: CateringCompanyService;

  beforeEach(async () => {
    jest.clearAllMocks();
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
      const req = { user: { companyId: null, external_auth_uid: 'abc' } };
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
        code: SUCCESS_CODE.CompanyCreated,
      });
    });

    it('should call cateringCompanyService.createCateringCompany with the correct arguments', async () => {
      const body = { name: 'tests' };
      const req = { user: { companyId: null, id: 'abc' } };
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
      const req = { user: { companyId: '123', external_auth_uid: 'abc' } };
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
      const req = { user: { companyId: undefined, external_auth_uid: 'abc' } };
      mockValidateCreateCateringCompanyRequestBody.mockReturnValue({
        valid: false,
        errors: {},
      });

      await expect(
        controller.createCateringCompany(invalidBody, req as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getIntegrations', () => {
    const mockRequest: AuthenticatedRequestForCompanyUser = {
      user: {
        companyId: 'company-id',
        // Add other necessary properties for the mock request
      },
    } as AuthenticatedRequestForCompanyUser;

    it('should call retrieveIntegrationsList with companyId and undefined query when no query parameters are provided', async () => {
      const result = [
        {
          key: 'val',
        } as unknown as CompanyIntegrationOutputItem,
      ] as CompanyIntegrationOutputItem[];
      jest
        .spyOn(cateringCompanyService, 'retrieveIntegrationsList')
        .mockResolvedValue(result);

      const response = await controller.getIntegrations(mockRequest, {});

      expect(
        cateringCompanyService.retrieveIntegrationsList,
      ).toHaveBeenCalledWith('company-id', undefined);
      expect(response).toBe(result);
    });

    it('should call retrieveIntegrationsList with companyId and query parameters when provided', async () => {
      const query: IBuildRetrieveCompanyIntegrationListArgs = {
        perPage: 10,
        pg: 1,
      };
      const result = [
        {
          key: 'val',
        } as unknown as CompanyIntegrationOutputItem,
      ] as CompanyIntegrationOutputItem[];
      jest
        .spyOn(cateringCompanyService, 'retrieveIntegrationsList')
        .mockResolvedValue(result);

      const response = await controller.getIntegrations(mockRequest, query);

      expect(
        cateringCompanyService.retrieveIntegrationsList,
      ).toHaveBeenCalledWith('company-id', query);
      expect(response).toBe(result);
    });

    it('should throw an error when retrieveIntegrationsList throws an error', async () => {
      const errorMessage = 'Some error occurred';
      jest
        .spyOn(cateringCompanyService, 'retrieveIntegrationsList')
        .mockRejectedValue(new Error(errorMessage));

      await expect(controller.getIntegrations(mockRequest, {})).rejects.toThrow(
        errorMessage,
      );
    });
  });

  describe('createIntegration', () => {
    const mockUser: AuthenticatedRequestForCompanyUser['user'] = {
      id: '1',
      companyId: '1',
      // Add other necessary user properties
    } as unknown as AuthenticatedRequestForCompanyUser['user'];

    const mockReq: AuthenticatedRequestForCompanyUser = {
      user: mockUser,
      // Add other necessary request properties
    } as unknown as AuthenticatedRequestForCompanyUser;

    it('should create an integration successfully', async () => {
      const templateId = 1;
      const mockIntegration = { id: 1 /* Add other integration properties */ };

      jest
        .spyOn(mockCateringCompanyService, 'createIntegration')
        .mockResolvedValue(mockIntegration as any);

      const result = await controller.createIntegration(mockReq, templateId);

      expect(cateringCompanyService.createIntegration).toHaveBeenCalledWith(
        mockUser.companyId,
        templateId,
        mockUser.id,
      );
      expect(result).toEqual(mockIntegration);
    });

    it('should throw an error if createIntegration fails', async () => {
      const templateId = 1;
      const errorMessage = 'Failed to create integration';

      jest
        .spyOn(mockCateringCompanyService, 'createIntegration')
        .mockRejectedValue(new Error(errorMessage));

      await expect(
        controller.createIntegration(mockReq, templateId),
      ).rejects.toThrow(errorMessage);
    });
  });
});
