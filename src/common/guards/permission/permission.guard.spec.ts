import { Test, TestingModule } from '@nestjs/testing';
import { CompanyRoleAndPermissionDbHandlerService } from '../../../internal-modules/external-handlers/db-handlers/company-role-and-permission-db-handler/company-role-and-permission-db-handler.service';
import { PermissionGuard } from './permission.guard';
import { Reflector } from '@nestjs/core';
import { mockCompanyRoleAndPermissionDbHandler } from '../../../../test/mocks/providers/mock_company_role_and_permission_db_handler';
import { DataAccessService } from '../../../internal-modules/external-handlers/data-access/data-access.service';
import { $Enums } from '@prisma/client';
import { mockGeneralDataAccessService } from '../../../../test/mocks/providers/data-access-services/general_data_access_service';
import { AuthenticatedRequest } from '../../../api/interfaces/authenticated-request.interface';
import { ExecutionContext } from '@nestjs/common';

describe('PermissionGuard', () => {
  let guard: PermissionGuard;
  let companyPermissionService: CompanyRoleAndPermissionDbHandlerService;
  let dataAccessService: DataAccessService<Set<$Enums.PermissionName>>;
  let reflector: Reflector;
  let context: ExecutionContext;

  const mockRequest = (
    user?: Partial<AuthenticatedRequest['user']>,
  ): AuthenticatedRequest =>
    ({
      user: user as AuthenticatedRequest['user'],
    }) as unknown as AuthenticatedRequest;

  beforeEach(async () => {
    context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest()),
      }),
    } as unknown as ExecutionContext;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionGuard,
        { provide: Reflector, useValue: { get: jest.fn() } },
        {
          provide: CompanyRoleAndPermissionDbHandlerService,
          useValue: mockCompanyRoleAndPermissionDbHandler,
        },
        { provide: DataAccessService, useValue: mockGeneralDataAccessService },
      ],
    }).compile();

    guard = module.get<PermissionGuard>(PermissionGuard);
    companyPermissionService =
      module.get<CompanyRoleAndPermissionDbHandlerService>(
        CompanyRoleAndPermissionDbHandlerService,
      );
    dataAccessService =
      module.get<DataAccessService<Set<$Enums.PermissionName>>>(
        DataAccessService,
      );
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should  return true when no permissions are required', async () => {
      jest.spyOn(reflector, 'get').mockReturnValueOnce(undefined);
      const canActivate = await guard.canActivate(context);
      expect(canActivate).toBe(true);
      expect(context.switchToHttp().getRequest).not.toHaveBeenCalled();
      expect(dataAccessService.retrieveAndCache).not.toHaveBeenCalled();
    });

    it('should return false when user is not on request', async () => {
      jest.spyOn(reflector, 'get').mockReturnValueOnce(['ManageBilling']);
      jest.spyOn(context.switchToHttp(), 'getRequest').mockReturnValue({});
      const canActivate = await guard.canActivate(context);
      expect(canActivate).toBe(false);
      expect(dataAccessService.retrieveAndCache).not.toHaveBeenCalled();
    });

    it('should return false when user is missing id', async () => {
      jest.spyOn(reflector, 'get').mockReturnValueOnce(['ManageBilling']);
      jest
        .spyOn(context.switchToHttp(), 'getRequest')
        .mockReturnValueOnce(mockRequest({ companyId: '1' }));
      const canActivate = await guard.canActivate(context);
      expect(canActivate).toBe(false);
      expect(dataAccessService.retrieveAndCache).not.toHaveBeenCalled();
    });

    it('should return false when user is missing companyId', async () => {
      jest.spyOn(reflector, 'get').mockReturnValueOnce(['ManageBilling']);
      jest
        .spyOn(context.switchToHttp(), 'getRequest')
        .mockReturnValueOnce(mockRequest({ id: '1' }));
      const canActivate = await guard.canActivate(context);
      expect(canActivate).toBe(false);
      expect(dataAccessService.retrieveAndCache).not.toHaveBeenCalled();
    });

    it('should call dataAccessService.retrieveAndCache if request is properly formed', async () => {
      jest.spyOn(reflector, 'get').mockReturnValueOnce(['ManageBilling']);
      jest
        .spyOn(context.switchToHttp(), 'getRequest')
        .mockReturnValueOnce(mockRequest({ id: '1', companyId: '123' }));
      await guard.canActivate(context);
      expect(dataAccessService.retrieveAndCache).toHaveBeenCalled();
    });

    it('should return true when user has all required permissions', async () => {
      jest
        .spyOn(reflector, 'get')
        .mockReturnValueOnce(['ManageBilling', 'ManageCompanyRoles']);
      jest
        .spyOn(dataAccessService, 'retrieveAndCache')
        .mockResolvedValueOnce(
          new Set(['ManageBilling', 'ManageCompanyRoles']),
        );
      jest
        .spyOn(context.switchToHttp(), 'getRequest')
        .mockReturnValueOnce(mockRequest({ id: '1', companyId: 'company-1' }));
      const canActivate = await guard.canActivate(context);
      expect(canActivate).toBe(true);
    });

    it('should return false when user has some but not all required permissions', async () => {
      jest
        .spyOn(reflector, 'get')
        .mockReturnValueOnce(['ManageBilling', 'ManageCompanyRoles']);
      jest
        .spyOn(dataAccessService, 'retrieveAndCache')
        .mockResolvedValueOnce(new Set(['ManageBilling']));
      jest
        .spyOn(context.switchToHttp(), 'getRequest')
        .mockReturnValueOnce(mockRequest({ id: '1', companyId: 'company-1' }));
      const canActivate = await guard.canActivate(context);
      expect(canActivate).toBe(false);
    });
  });
});
