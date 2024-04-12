import { Test, TestingModule } from '@nestjs/testing';
import { CateringCompanyDbHandlerService } from './catering-company-db-handler.service';
import { CateringCompanyDbQueryBuilderService } from './catering-company-db-query-builder.service';
import { PrismaClientService } from '../../../../external-modules/prisma-client/prisma-client.service';
import { mockCateringCompanyDbQueryBuilderService } from '../../../../../test/mocks/providers/mock_catering_company_db_querybuilder';
import { mockPrismaClientService } from '../../../../../test/mocks/providers/mock_prisma_client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import uuidUtils from '../../../../utility/functions/uuid-utils';
import { $Enums, Prisma } from '@prisma/client';
import { CompanyIntegrationListItem } from '../../../../common/types/company-integration-list-item.type';
import { InvalidUUIDError } from '../../../../common/errors/invalid_uuid.error';
import { IBuildRetrieveCompanyIntegrationListArgs } from './interfaces/query-builder-args.interfaces';
import { SystemIntegrationDbQueryBuilderService } from './system-integration-db-query-builder.service';
import { mockSystemIntegrationDbQueryBuilder } from '../../../../../test/mocks/providers/mock_system_integration_db_querybuilder';

describe('CateringCompanyDbHandlerService', () => {
  let service: CateringCompanyDbHandlerService;
  let cateringCompanyDbQueryBuilder: CateringCompanyDbQueryBuilderService;
  let systemIntegrationDbQueryBuilder: SystemIntegrationDbQueryBuilderService;
  let prismaClient: PrismaClientService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CateringCompanyDbHandlerService,
        {
          provide: CateringCompanyDbQueryBuilderService,
          useValue: mockCateringCompanyDbQueryBuilderService,
        },
        {
          provide: SystemIntegrationDbQueryBuilderService,
          useValue: mockSystemIntegrationDbQueryBuilder,
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
    systemIntegrationDbQueryBuilder =
      module.get<SystemIntegrationDbQueryBuilderService>(
        SystemIntegrationDbQueryBuilderService,
      );
    prismaClient = module.get<PrismaClientService>(PrismaClientService);

    // Default mock return "true" - change in tests as required
    jest.spyOn(uuidUtils, 'isUUID').mockReturnValue(true);
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
        const queryMinusInclude = { where: { companyId: mockCompanyId } };
        jest
          .spyOn(
            cateringCompanyDbQueryBuilder,
            'buildRetrieveCompanyIntegrationsListQueryWithoutInclude',
          )
          .mockReturnValue(queryMinusInclude);

        const result = await service.retrieveCompanyIntegrationsList(
          mockCompanyId,
          undefined,
        );

        expect(prismaClient.companyIntegration.findMany).toHaveBeenCalledWith({
          ...queryMinusInclude,
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
        const queryMinusInclude = { where: { companyId: mockCompanyId } };
        jest
          .spyOn(
            cateringCompanyDbQueryBuilder,
            'buildRetrieveCompanyIntegrationsListQueryWithoutInclude',
          )
          .mockReturnValue(queryMinusInclude);

        jest
          .spyOn(prismaClient.companyIntegration, 'findMany')
          .mockResolvedValue([]);

        const result = await service.retrieveCompanyIntegrationsList(
          mockCompanyId,
          undefined,
        );

        expect(prismaClient.companyIntegration.findMany).toHaveBeenCalledWith({
          ...queryMinusInclude,
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

    describe('query defined', () => {
      const validCompanyId = 'valid-id';
      const PG_NUM = 2;
      const PER_PAGE = 10;
      const IS_ACTIVE = false;

      const queryInput: IBuildRetrieveCompanyIntegrationListArgs = {
        pg: PG_NUM,
        perPage: PER_PAGE,
        isActive: IS_ACTIVE,
      };
      const queryBuilderOutput: Omit<
        Prisma.CompanyIntegrationFindManyArgs,
        'include'
      > = {
        where: { companyId: validCompanyId, isActive: IS_ACTIVE },
        take: PER_PAGE,
        skip: (PG_NUM - 1) * PER_PAGE,
      };

      it('should call query builder with query', async () => {
        const spy = jest
          .spyOn(
            cateringCompanyDbQueryBuilder,
            'buildRetrieveCompanyIntegrationsListQueryWithoutInclude',
          )
          .mockReturnValue(queryBuilderOutput);

        await service.retrieveCompanyIntegrationsList(
          validCompanyId,
          queryInput,
        );
        expect(spy).toHaveBeenCalledWith(validCompanyId, queryInput);
      });
      it('should include full return from query builder in call to prisma client', async () => {
        jest
          .spyOn(
            cateringCompanyDbQueryBuilder,
            'buildRetrieveCompanyIntegrationsListQueryWithoutInclude',
          )
          .mockReturnValue(queryBuilderOutput);

        await service.retrieveCompanyIntegrationsList(
          validCompanyId,
          queryInput,
        );
        expect(prismaClient.companyIntegration.findMany).toHaveBeenCalledWith({
          ...queryBuilderOutput,
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
      });
    });
  });

  describe('createIntegration', () => {
    const companyId = 'valid-uuid';
    const templateId = 1;
    const creatorId = 'valid-creator-id';

    it('should create a company integration successfully', async () => {
      const mockIntegration = {
        requirements: [{ assets: [{ id: 1 }, { id: 2 }] }, { assets: [] }],
        event: $Enums.IntegrationEvent.ezCaterOrderReceived,
      };
      const mockCompanyIntegration = { id: 'integration-id' };

      jest
        .spyOn(prismaClient.integrationTemplate, 'findUniqueOrThrow')
        .mockResolvedValueOnce(mockIntegration as any);

      jest
        .spyOn(prismaClient.companyIntegration, 'create')
        .mockResolvedValueOnce(mockCompanyIntegration as any);

      const result = await service.createIntegration(
        companyId,
        templateId,
        creatorId,
      );

      expect(result.companyIntegration).toEqual(mockCompanyIntegration);
      expect(result.metRequirements).toHaveLength(1);
      expect(result.unmetRequirements).toHaveLength(1);
      expect(
        prismaClient.integrationTemplate.findUniqueOrThrow,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          ...systemIntegrationDbQueryBuilder.buildRetrieveIntegrationQueryWithoutInclude(
            templateId,
          ),
          include: expect.objectContaining({
            requirements: expect.objectContaining({
              include: expect.objectContaining({
                assets: expect.objectContaining({
                  where: { companyId },
                }),
              }),
            }),
          }),
        }),
      );
      expect(prismaClient.companyIntegration.create).toHaveBeenCalledWith(
        cateringCompanyDbQueryBuilder.buildCreateCompanyIntegration(
          companyId,
          templateId,
          mockIntegration.event,
          creatorId,
          ['1', '2'],
        ),
      );
    });

    it('should throw an InvalidUUIDError if companyId is not a valid UUID', async () => {
      const invalidCompanyId = 'invalid-uuid';
      jest.spyOn(uuidUtils, 'isUUID').mockReturnValueOnce(false);

      await expect(
        service.createIntegration(invalidCompanyId, templateId, creatorId),
      ).rejects.toThrow(InvalidUUIDError);
      expect(uuidUtils.isUUID).toHaveBeenCalledWith(invalidCompanyId);
    });

    it('should throw an error if integrationTemplate is not found', async () => {
      // In case I decide to handle it differently later, this is a PrismaKnownError with code 'P2025'
      const error = new Error('Integration template not found');
      jest
        .spyOn(prismaClient.integrationTemplate, 'findUniqueOrThrow')
        .mockRejectedValueOnce(error);

      await expect(
        service.createIntegration(companyId, templateId, creatorId),
      ).rejects.toThrow(error);
    });

    it('should create a company integration with no existing assets', async () => {
      const mockIntegration = {
        requirements: [{ assets: [] }, { assets: [] }],
        event: $Enums.IntegrationEvent.ezCaterOrderReceived,
      };
      const mockCompanyIntegration = { id: 'integration-id' };

      jest
        .spyOn(prismaClient.integrationTemplate, 'findUniqueOrThrow')
        .mockResolvedValueOnce(mockIntegration as any);
      jest
        .spyOn(prismaClient.companyIntegration, 'create')
        .mockResolvedValueOnce(mockCompanyIntegration as any);

      const result = await service.createIntegration(
        companyId,
        templateId,
        creatorId,
      );

      expect(result.companyIntegration).toEqual(mockCompanyIntegration);
      expect(result.metRequirements).toHaveLength(0);
      expect(result.unmetRequirements).toHaveLength(2);
      expect(prismaClient.companyIntegration.create).toHaveBeenCalledWith(
        cateringCompanyDbQueryBuilder.buildCreateCompanyIntegration(
          companyId,
          templateId,
          mockIntegration.event,
          creatorId,
          undefined,
        ),
      );
    });

    it('should create a company integration with existing assets', async () => {
      const existingAssetId = 'existing-asset-id';
      const mockIntegration = {
        requirements: [
          { assets: [] },
          { assets: [{ id: existingAssetId } as any] },
        ],
        event: $Enums.IntegrationEvent.ezCaterOrderReceived,
      };
      const mockCompanyIntegration = { id: 'integration-id' };

      jest
        .spyOn(prismaClient.integrationTemplate, 'findUniqueOrThrow')
        .mockResolvedValueOnce(mockIntegration as any);
      jest
        .spyOn(prismaClient.companyIntegration, 'create')
        .mockResolvedValueOnce(mockCompanyIntegration as any);

      const result = await service.createIntegration(
        companyId,
        templateId,
        creatorId,
      );

      expect(result.companyIntegration).toEqual(mockCompanyIntegration);
      expect(result.metRequirements).toHaveLength(1);
      expect(result.unmetRequirements).toHaveLength(1);
      expect(prismaClient.companyIntegration.create).toHaveBeenCalledWith(
        cateringCompanyDbQueryBuilder.buildCreateCompanyIntegration(
          companyId,
          templateId,
          mockIntegration.event,
          creatorId,
          [existingAssetId],
        ),
      );
    });
  });

  describe('createIntegrationAsset Claude', () => {
    it('should create a new integration asset successfully', async () => {});

    it('should throw an InvalidUUIDError if companyId is not a valid UUID', async () => {});

    it('should throw an InvalidUUIDError if creatorId is not a valid UUID', async () => {});

    it('should throw an error if the integration requirement is not found', async () => {});

    it("should throw an error if isSecret does not match the requirement's isSecret flag", async () => {});

    it('should throw an error if the requirement level is Company and an asset already exists', async () => {});

    it('should throw an error if the requirement level is Menu and menuId is not provided', async () => {});

    it('should create an asset with companyIntegrationIds if there are associated integrations', async () => {});

    it('should create an asset without companyIntegrationIds if there are no associated integrations', async () => {});

    it('should call prismaClient.integrationRequirement.findUniqueOrThrow with the correct arguments', async () => {});

    it('should call prismaClient.companyIntegrationAsset.create with the correct arguments', async () => {});

    it('should call cateringCompanyDbQueryBuilder.buildCreateCompanyIntegrationAsset with the correct arguments', async () => {});

    it('should return the newly created asset', async () => {});

    it('should handle the case when data is not provided', async () => {});

    it('should handle the case when menuId is not provided', async () => {});

    it('should handle the case when requirement.templates is empty', async () => {});

    it('should handle the case when requirement.assets is empty', async () => {});

    it('should handle the case when requirement.level is not Company or Menu', async () => {});
  });
});
