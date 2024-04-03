import { Test, TestingModule } from '@nestjs/testing';
import { CateringCompanyDbHandlerService } from './catering-company-db-handler.service';
import { CateringCompanyDbQueryBuilderService } from './catering-company-db-query-builder.service';
import { PrismaClientService } from '../../../../external-modules/prisma-client/prisma-client.service';
import { mockCateringCompanyDbQueryBuilderService } from '../../../../../test/mocks/providers/mock_catering_company_db_querybuilder';
import { mockPrismaClientService } from '../../../../../test/mocks/providers/mock_prisma_client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import uuidUtils from '../../../../utility/functions/uuid-utils';
import { $Enums } from '@prisma/client';
import { CompanyIntegrationListItem } from '../../../../common/types/company-integration-list-item.type';
import { InvalidUUIDError } from '../../../../common/errors/invalid_uuid.error';

describe('CateringCompanyDbHandlerService', () => {
  let service: CateringCompanyDbHandlerService;
  let cateringCompanyDbQueryBuilder: CateringCompanyDbQueryBuilderService;
  let prismaClient: PrismaClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CateringCompanyDbHandlerService,
        {
          provide: CateringCompanyDbQueryBuilderService,
          useValue: mockCateringCompanyDbQueryBuilderService,
        },
        { provide: PrismaClientService, useValue: mockPrismaClientService },
      ],
    }).compile();

    service = module.get<CateringCompanyDbHandlerService>(
      CateringCompanyDbHandlerService,
    );
    cateringCompanyDbQueryBuilder =
      module.get<CateringCompanyDbQueryBuilderService>(
        CateringCompanyDbQueryBuilderService,
      );
    prismaClient = module.get<PrismaClientService>(PrismaClientService);

    // Default mock return "true" - change in tests as required
    jest.spyOn(uuidUtils, 'isUUID').mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCateringCompany', () => {
    const cateringCompanyData = {
      name: 'Test CateringCompany',
      ownerId: 'ownerId',
    };
    const createdCateringCompany = {
      ...cateringCompanyData,
      id: 'generatedId',
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a cateringCompany and return it if ownerId references an existing user not referenced in another cateringCompany record', async () => {
      jest
        .spyOn(cateringCompanyDbQueryBuilder, 'buildCreateCateringCompanyQuery')
        .mockReturnValue({ data: cateringCompanyData });
      jest
        .spyOn(prismaClient.cateringCompany, 'create')
        .mockResolvedValue(createdCateringCompany);

      const result = await service.createCateringCompany(
        cateringCompanyData.name,
        cateringCompanyData.ownerId,
      );
      expect(result).toEqual(createdCateringCompany);
      expect(
        cateringCompanyDbQueryBuilder.buildCreateCateringCompanyQuery,
      ).toHaveBeenCalledWith({
        name: cateringCompanyData.name,
        ownerId: cateringCompanyData.ownerId,
      });
      expect(prismaClient.cateringCompany.create).toHaveBeenCalledWith({
        data: cateringCompanyData,
      });
    });

    it('should throw an error if the ownerId unique constraint is violated', async () => {
      expect.assertions(2);

      jest
        .spyOn(cateringCompanyDbQueryBuilder, 'buildCreateCateringCompanyQuery')
        .mockReturnValue({ data: cateringCompanyData });
      jest
        .spyOn(prismaClient.cateringCompany, 'create')
        .mockRejectedValue(
          new PrismaClientKnownRequestError('', { code: 'P2002' } as any),
        );

      try {
        await service.createCateringCompany(
          cateringCompanyData.name,
          cateringCompanyData.ownerId,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(PrismaClientKnownRequestError);
        expect(error.code).toBe('P2002');
      }
    });

    it('should throw an error if the ownerId existence constraint is violated', async () => {
      expect.assertions(2);

      jest
        .spyOn(cateringCompanyDbQueryBuilder, 'buildCreateCateringCompanyQuery')
        .mockReturnValue({ data: cateringCompanyData });
      jest
        .spyOn(prismaClient.cateringCompany, 'create')
        .mockRejectedValue(
          new PrismaClientKnownRequestError('', { code: 'P2003' } as any),
        );

      try {
        await service.createCateringCompany(
          cateringCompanyData.name,
          cateringCompanyData.ownerId,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(PrismaClientKnownRequestError);
        expect(error.code).toBe('P2003');
      }
    });
  });

  describe('retrieveCompanyIntegrationsList', () => {
    const mockCompanyId = '123e4567-e89b-12d3-a456-426655440000';
    const mockIntegrationRecords: CompanyIntegrationListItem[] = [
      {
        id: '1',
        companyId: mockCompanyId,
        templateId: 1,
        event: $Enums.IntegrationEvent.ezCaterOrderReceived,
        isConfigured: true,
        isActive: true,
        createdAt: new Date(),
        creatorId: '',
        template: {
          srcSystem: $Enums.ExternalSystem.ezCater,
          srcEntity: $Enums.ExternalEntity.Order,
          targetSystem: $Enums.ExternalSystem.Nutshell,
          targetEntity: $Enums.ExternalEntity.Lead,
        },
      },
      // Add more mock integration records as needed
    ];

    beforeEach(() => {
      jest
        .spyOn(prismaClient.companyIntegration, 'findMany')
        .mockResolvedValue(mockIntegrationRecords);
    });

    describe('query undefined', () => {
      it('should return company integration records when given a valid company ID', async () => {
        const whereClause = { companyId: mockCompanyId };
        jest
          .spyOn(
            cateringCompanyDbQueryBuilder,
            'buildRetrieveCompanyIntegrationsListWhereClause',
          )
          .mockReturnValue(whereClause);

        const result = await service.retrieveCompanyIntegrationsList(
          mockCompanyId,
          undefined,
        );

        expect(prismaClient.companyIntegration.findMany).toHaveBeenCalledWith({
          where: { companyId: mockCompanyId },
          include: {
            template: {
              select: {
                srcSystem: true,
                srcEntity: true,
                targetSystem: true,
                targetEntity: true,
              },
            },
          },
        });
        expect(result).toEqual(mockIntegrationRecords);
      });

      it('should throw an InvalidUUIDError when given an invalid company ID', async () => {
        const invalidCompanyId = 'invalid-uuid';
        jest.spyOn(uuidUtils, 'isUUID').mockReturnValue(false);

        await expect(
          service.retrieveCompanyIntegrationsList(invalidCompanyId, undefined),
        ).rejects.toThrow(InvalidUUIDError);
        expect(prismaClient.companyIntegration.findMany).not.toHaveBeenCalled();
      });

      it('should return an empty array when no integration records are found for the given company ID', async () => {
        const whereClause = { companyId: mockCompanyId };
        jest
          .spyOn(
            cateringCompanyDbQueryBuilder,
            'buildRetrieveCompanyIntegrationsListWhereClause',
          )
          .mockReturnValue(whereClause);

        jest
          .spyOn(prismaClient.companyIntegration, 'findMany')
          .mockResolvedValue([]);

        const result = await service.retrieveCompanyIntegrationsList(
          mockCompanyId,
          undefined,
        );

        expect(prismaClient.companyIntegration.findMany).toHaveBeenCalledWith({
          where: whereClause,
          include: {
            template: {
              select: {
                srcSystem: true,
                srcEntity: true,
                targetSystem: true,
                targetEntity: true,
              },
            },
          },
        });
        expect(result).toEqual([]);
      });

      it('should throw an error when the Prisma query fails', async () => {
        const errorMessage = 'Prisma query failed';

        jest
          .spyOn(prismaClient.companyIntegration, 'findMany')
          .mockRejectedValue(new Error(errorMessage));

        await expect(
          service.retrieveCompanyIntegrationsList(mockCompanyId, undefined),
        ).rejects.toThrow(errorMessage);
      });

      it('should return integration records with the correct template details', async () => {
        const result = await service.retrieveCompanyIntegrationsList(
          mockCompanyId,
          undefined,
        );

        expect(result[0].template).toEqual({
          srcSystem: $Enums.ExternalSystem.ezCater,
          srcEntity: $Enums.ExternalEntity.Order,
          targetSystem: $Enums.ExternalSystem.Nutshell,
          targetEntity: $Enums.ExternalEntity.Lead,
        });
      });
    });
  });
});
