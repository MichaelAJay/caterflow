import { Test, TestingModule } from '@nestjs/testing';
import { CateringCompanyDbHandlerService } from './catering-company-db-handler.service';
import { CateringCompanyDbQueryBuilderService } from './catering-company-db-query-builder.service';
import { PrismaClientService } from '../../../../external-modules/prisma-client/prisma-client.service';
import { mockPrismaClientService } from '../../../../../test/mocks/providers/mock_prisma_client';
import uuidUtils from '../../../../utility/functions/uuid-utils';
import { $Enums, CompanyMenu } from '@prisma/client';
import { CompanyIntegrationListItem } from '../../../../common/types/company-integration-list-item.type';
import { InvalidUUIDError } from '../../../../common/errors/invalid_uuid.error';
import { IBuildRetrieveCompanyIntegrationListArgs } from './interfaces/query-builder-args.interfaces';
import { SystemIntegrationDbQueryBuilderService } from './system-integration-db-query-builder.service';

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
        CateringCompanyDbQueryBuilderService,
        SystemIntegrationDbQueryBuilderService,
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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCateringCompany', () => {
    const cateringCompanyData = {
      name: 'Test CateringCompany',
      ownerId: 'a056125b-92da-43cb-87ce-62f49530d3ad',
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
        .spyOn(prismaClient.cateringCompany, 'create')
        .mockResolvedValue(createdCateringCompany);

      const result = await service.createCateringCompany(
        cateringCompanyData.name,
        cateringCompanyData.ownerId,
      );
      expect(result).toEqual(createdCateringCompany);
      expect(prismaClient.cateringCompany.create).toHaveBeenCalledWith({
        data: cateringCompanyData,
      });
    });
  });

  describe('retrieveCompanyIntegrationsList', () => {
    const mockCompanyId = '5bc2f8f1-5317-48c2-aa54-3dc9f6e6a540';
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
        const queryMinusInclude = {
          where: { companyId: mockCompanyId },
          take: 10,
        };

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

      it('should call prismaClient.companyIntegration.findMany with "include"', async () => {
        await service.retrieveCompanyIntegrationsList(mockCompanyId, undefined);

        expect(prismaClient.companyIntegration.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ include: expect.anything() }),
        );
      });

      it('should call prismaClient.companyIntegration.findMany with default "take"', async () => {
        jest.spyOn(prismaClient.companyIntegration, 'findMany');

        await service.retrieveCompanyIntegrationsList(mockCompanyId, undefined);

        expect(prismaClient.companyIntegration.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            take: 10,
          }),
        );
      });

      it('should throw an InvalidUUIDError when given an invalid company ID', async () => {
        const invalidCompanyId = 'invalid-uuid';

        await expect(
          service.retrieveCompanyIntegrationsList(invalidCompanyId, undefined),
        ).rejects.toThrow(InvalidUUIDError);
        expect(prismaClient.companyIntegration.findMany).not.toHaveBeenCalled();
      });
    });

    describe('query defined - prismaClient.companyIntegrations.findMany input focus', () => {
      const validCompanyId = '356fbd4a-160d-45b4-9809-9956fc135284';
      const PG_NUM = 2;
      const PER_PAGE = 10;
      const IS_ACTIVE = false;
      let query: IBuildRetrieveCompanyIntegrationListArgs;

      it('calls with where.companyId and include', async () => {
        query = { pg: 2 };

        await service.retrieveCompanyIntegrationsList(validCompanyId, query);
        expect(prismaClient.companyIntegration.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.anything(),
            include: expect.anything(),
          }),
        );
      });
      it('calls with default "take" if "perPage" not included in query', async () => {
        query = { pg: 2 };

        await service.retrieveCompanyIntegrationsList(validCompanyId, query);
        expect(prismaClient.companyIntegration.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            take: 10,
          }),
        );
      });
      it('calls with specified "take" if "perPage" included in query', async () => {
        query = { perPage: PER_PAGE };

        await service.retrieveCompanyIntegrationsList(validCompanyId, query);
        expect(prismaClient.companyIntegration.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            take: PER_PAGE,
          }),
        );
      });
      it('it does not call with "skip" if "pg" not included in query', async () => {
        query = { perPage: 2 };

        await service.retrieveCompanyIntegrationsList(validCompanyId, query);
        expect(
          prismaClient.companyIntegration.findMany,
        ).not.toHaveBeenCalledWith(
          expect.objectContaining({
            skip: expect.anything(),
          }),
        );
      });
      it('it does not call with "skip" if "pg" is 1', async () => {
        query = { pg: 1 };

        await service.retrieveCompanyIntegrationsList(validCompanyId, query);
        expect(
          prismaClient.companyIntegration.findMany,
        ).not.toHaveBeenCalledWith(
          expect.objectContaining({
            skip: expect.anything(),
          }),
        );
      });
      it('calls with correct "skip" if "pg" is greater than 1 and "perPage" is undefined', async () => {
        query = { pg: 2 };

        const DEFAULT_PER_PAGE = 10;

        await service.retrieveCompanyIntegrationsList(validCompanyId, query);
        expect(prismaClient.companyIntegration.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            take: 10,
            // (pg - 1) * default perPage
            skip: ((query.pg as number) - 1) * DEFAULT_PER_PAGE,
          }),
        );
      });
      it('calls with correct "skip" if "pg" is greater than 1 and "perPage" is included', async () => {
        query = { pg: 3, perPage: 5 };

        await service.retrieveCompanyIntegrationsList(validCompanyId, query);
        expect(prismaClient.companyIntegration.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            take: 5,
            // (pg - 1) * perPage
            skip: ((query.pg as number) - 1) * (query.perPage as number),
          }),
        );
      });
      it('calls with "where.isConfigured" if "isConfigured" is included and true', async () => {
        const isConfigured = true;
        query = { isConfigured };

        await service.retrieveCompanyIntegrationsList(validCompanyId, query);
        expect(prismaClient.companyIntegration.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({ isConfigured }),
          }),
        );
      });
      it('calls with "where.isConfigured" if "isConfigured" is included and false', async () => {
        const isConfigured = false;
        query = { isConfigured };

        await service.retrieveCompanyIntegrationsList(validCompanyId, query);
        expect(prismaClient.companyIntegration.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({ isConfigured }),
          }),
        );
      });
      it('it does not call with "where.isConfigured" if "isConfigured" is undefined', async () => {
        const isConfigured = undefined;
        query = { isConfigured };

        await service.retrieveCompanyIntegrationsList(validCompanyId, query);
        expect(
          prismaClient.companyIntegration.findMany,
        ).not.toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({ isConfigured }),
          }),
        );
      });
      it('calls with "where.isActive" if "isActive" is included and true', async () => {
        const isActive = true;
        query = { isActive };

        await service.retrieveCompanyIntegrationsList(validCompanyId, query);
        expect(prismaClient.companyIntegration.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({ isActive }),
          }),
        );
      });
      it('calls with "where.isActive" if "isActive" is included and false', async () => {
        const isActive = false;
        query = { isActive };

        await service.retrieveCompanyIntegrationsList(validCompanyId, query);
        expect(prismaClient.companyIntegration.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({ isActive }),
          }),
        );
      });
      it('it does not call with "where.isActive" if "isActive" is undefined', async () => {
        const isActive = undefined;
        query = { isActive };

        await service.retrieveCompanyIntegrationsList(validCompanyId, query);
        expect(
          prismaClient.companyIntegration.findMany,
        ).not.toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({ isActive }),
          }),
        );
      });
      it('does not call with "where.createdAt if "createdSince" is not included in query', async () => {
        query = { pg: 1 };

        await service.retrieveCompanyIntegrationsList(validCompanyId, query);
        expect(
          prismaClient.companyIntegration.findMany,
        ).not.toHaveBeenCalledWith(
          expect.objectContaining({ where: { createdAt: expect.anything() } }),
        );
      });
      it('calls with "where.createdAt" if "createdSince" is included in query', async () => {
        const date = new Date();
        query = { createdSince: date };

        await service.retrieveCompanyIntegrationsList(validCompanyId, query);
        expect(prismaClient.companyIntegration.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({ createdAt: { gte: date } }),
          }),
        );
      });
      it('does not call with "where.template" if templateSrcSystem AND templateTargetSystem are undefined', async () => {
        query = { pg: 2 };
        await service.retrieveCompanyIntegrationsList(validCompanyId, query);
        expect(
          prismaClient.companyIntegration.findMany,
        ).not.toHaveBeenCalledWith(
          expect.objectContaining({ where: { template: expect.anything() } }),
        );
      });
      it('calls with "where.template" if templateSrcSystem is defined and templateTargetSystem is undefined', async () => {
        query = { templateSrcSystem: 'ezCater' };
        await service.retrieveCompanyIntegrationsList(validCompanyId, query);
        expect(prismaClient.companyIntegration.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              template: { AND: [{ srcSystem: 'ezCater' }] },
            }),
          }),
        );
      });
      it('calls with "where.template" if templateTargetSystem is defined and templateSrcSystem is undefined', async () => {
        query = { templateTargetSystem: 'ezCater' };
        await service.retrieveCompanyIntegrationsList(validCompanyId, query);
        expect(prismaClient.companyIntegration.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              template: { AND: [{ targetSystem: 'ezCater' }] },
            }),
          }),
        );
      });
      it('calls with "where.template" if templateSrcSystem AND templateTargetSystem are defined', async () => {
        query = {
          templateSrcSystem: 'ezCater',
          templateTargetSystem: 'Nutshell',
        };
        await service.retrieveCompanyIntegrationsList(validCompanyId, query);
        expect(prismaClient.companyIntegration.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              template: {
                AND: [{ srcSystem: 'ezCater' }, { targetSystem: 'Nutshell' }],
              },
            }),
          }),
        );
      });
      it('does not call with "orderBy" if sort is undefined', async () => {
        query = { pg: 2 };

        await service.retrieveCompanyIntegrationsList(validCompanyId, query);
        expect(
          prismaClient.companyIntegration.findMany,
        ).not.toHaveBeenCalledWith(
          expect.objectContaining({ orderBy: expect.anything() }),
        );
      });
      it('calls with "orderBy" asc if sort is "created_asc"', async () => {
        query = { sort: 'created_asc' };

        await service.retrieveCompanyIntegrationsList(validCompanyId, query);
        expect(prismaClient.companyIntegration.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ orderBy: { createdAt: 'asc' } }),
        );
      });
      it('calls with "orderBy" desc if sort is "created_desc', async () => {
        query = { sort: 'created_desc' };

        await service.retrieveCompanyIntegrationsList(validCompanyId, query);
        expect(prismaClient.companyIntegration.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ orderBy: { createdAt: 'desc' } }),
        );
      });
      it('calls with full query object if everything is included', async () => {
        const STATIC_INCLUDE = {
          template: {
            select: {
              srcSystem: true,
              srcEntity: true,
              targetSystem: true,
              targetEntity: true,
            },
          },
        };

        const pg = 4;
        const perPage = 7;
        const isConfigured = false;
        const isActive = true;
        const createdSince = new Date();
        const templateSrcSystem = 'ezCater';
        const templateTargetSystem = 'Nutshell';
        const sort = 'created_asc';

        query = {
          pg,
          perPage,
          isConfigured,
          isActive,
          createdSince,
          templateSrcSystem,
          templateTargetSystem,
          sort,
        };

        await service.retrieveCompanyIntegrationsList(validCompanyId, query);
        expect(prismaClient.companyIntegration.findMany).toHaveBeenCalledWith({
          where: {
            companyId: validCompanyId,
            isConfigured,
            isActive,
            createdAt: { gte: createdSince },
            template: {
              AND: [
                { srcSystem: templateSrcSystem },
                { targetSystem: templateTargetSystem },
              ],
            },
          },
          skip: (pg - 1) * perPage,
          take: perPage,
          orderBy: { createdAt: 'asc' },
          include: STATIC_INCLUDE,
        });
      });
    });
  });

  describe('createIntegration', () => {
    const companyId = '3e2c59f2-b94b-4a45-b295-c08f0b969586';
    const templateId = 1;
    const creatorId = '6a0cba0a-7cce-4c4d-bfef-90f495d4c6da';

    // it('should create a company integration successfully', async () => {
    //   const mockIntegrationTemplate = {
    //     requirements: [
    //       {
    //         level: $Enums.IntegrationRequirementLevel.Company,
    //         assets: [{ id: '1' }],
    //       },
    //       {
    //         id: 2,
    //         type: $Enums.IntegrationAssetType.API_CREDENTIAL_API_KEY,
    //         system: $Enums.ExternalSystem.ezCater,
    //         level: $Enums.IntegrationRequirementLevel.Company,
    //         assets: [],
    //       },
    //     ],
    //     event: $Enums.IntegrationEvent.ezCaterOrderReceived,
    //   };
    //   const mockCompanyIntegration = { id: 'integration-id' };

    //   jest
    //     .spyOn(prismaClient.integrationTemplate, 'findUniqueOrThrow')
    //     .mockResolvedValueOnce(mockIntegrationTemplate as any);

    //   jest.spyOn(prismaClient.companyMenu, 'findMany').mockResolvedValue([]);
    //   jest
    //     .spyOn(prismaClient.companyIntegration, 'create')
    //     .mockResolvedValueOnce(mockCompanyIntegration as any);

    //   const result = await service.createIntegration(
    //     companyId,
    //     templateId,
    //     creatorId,
    //   );

    //   expect(result.companyIntegration).toEqual(mockCompanyIntegration);
    //   expect(
    //     prismaClient.integrationTemplate.findUniqueOrThrow,
    //   ).toHaveBeenCalledWith({
    //     where: { id: templateId },
    //     include: {
    //       requirements: {
    //         include: {
    //           assets: {
    //             where: { companyId },
    //             select: {
    //               id: true,
    //               menuId: true,
    //             },
    //           },
    //         },
    //       },
    //     },
    //   });
    //   expect(prismaClient.companyIntegration.create).toHaveBeenCalledWith({
    //     data: {
    //       companyId,
    //       templateId,
    //       event: $Enums.IntegrationEvent.ezCaterOrderReceived,
    //       creatorId,
    //       assets: {
    //         connect: [{ id: '1' }],
    //         create: [
    //           {
    //             companyId,
    //             creatorId,
    //             integrationRequirementId: 2,
    //             system: $Enums.ExternalSystem.ezCater,
    //             type: $Enums.IntegrationAssetType.API_CREDENTIAL_API_KEY,
    //           },
    //         ],
    //       },
    //     },
    //     include: { assets: true },
    //   });
    // });

    it('should create a company integration successfully if menus & menu requirements', async () => {
      const mockMenu_1 = { id: 10 },
        mockMenu_2 = { id: 11 };
      const mockMenus = [mockMenu_1, mockMenu_2] as CompanyMenu[];

      const mockIntegrationTemplate = {
        requirements: [
          {
            id: 1,
            level: $Enums.IntegrationRequirementLevel.Menu,
            type: $Enums.IntegrationAssetType.DATA_MAP,
            // Two existing assets which reference the same requirement (obviously), but differ in menuId
            // Should connect two
            assets: [
              { id: '1', integrationRequirementId: 1, menuId: mockMenu_1.id },
              { id: '2', integrationRequirementId: 1, menuId: mockMenu_2.id },
            ],
          },
          {
            id: 2,
            level: $Enums.IntegrationRequirementLevel.Menu,
            type: $Enums.IntegrationAssetType.DATA_MAP,
            assets: [
              // One exist asset which references the requirement. Should connect one and create one
              { id: '3', integrationRequirementId: 2, menuId: mockMenu_1.id },
            ],
          },
          {
            id: 3,
            level: $Enums.IntegrationRequirementLevel.Menu,
            type: $Enums.IntegrationAssetType.DATA_MAP,
            // Empty array - should create two assets
            assets: [],
          },
        ],
        event: $Enums.IntegrationEvent.ezCaterOrderReceived,
      };
      const mockCompanyIntegration = { id: 'integration-id' };

      jest
        .spyOn(prismaClient.integrationTemplate, 'findUniqueOrThrow')
        .mockResolvedValueOnce(mockIntegrationTemplate as any);

      jest
        .spyOn(prismaClient.companyMenu, 'findMany')
        .mockResolvedValue(mockMenus);
      jest
        .spyOn(prismaClient.companyIntegration, 'create')
        .mockResolvedValueOnce(mockCompanyIntegration as any);

      const result = await service.createIntegration(
        companyId,
        templateId,
        creatorId,
      );

      expect(result.companyIntegration).toEqual(mockCompanyIntegration);
      expect(
        prismaClient.integrationTemplate.findUniqueOrThrow,
      ).toHaveBeenCalledWith({
        where: { id: templateId },
        include: {
          requirements: {
            include: {
              assets: {
                where: { companyId },
                select: {
                  id: true,
                  menuId: true,
                },
              },
            },
          },
        },
      });
      expect(prismaClient.companyIntegration.create).toHaveBeenCalledWith({
        data: {
          companyId,
          templateId,
          event: $Enums.IntegrationEvent.ezCaterOrderReceived,
          creatorId,
          assets: {
            connect: [{ id: '1' }, { id: '2' }, { id: '3' }],
            create: [
              {
                companyId,
                creatorId,
                integrationRequirementId: 2,
                type: $Enums.IntegrationAssetType.DATA_MAP,
                menuId: mockMenu_2.id,
              },
              {
                companyId,
                creatorId,
                integrationRequirementId: 3,
                type: $Enums.IntegrationAssetType.DATA_MAP,
                menuId: mockMenu_1.id,
              },
              {
                companyId,
                creatorId,
                integrationRequirementId: 3,
                type: $Enums.IntegrationAssetType.DATA_MAP,
                menuId: mockMenu_2.id,
              },
            ],
          },
        },
        include: { assets: true },
      });
    });

    // it('should create a company integration successfully if menus & no menu requirements', async () => {
    //   const mockIntegrationTemplate = {
    //     requirements: [
    //       {
    //         level: $Enums.IntegrationRequirementLevel.Company,
    //         assets: [{ id: '1' }],
    //       },
    //       {
    //         id: 2,
    //         type: $Enums.IntegrationAssetType.API_CREDENTIAL_API_KEY,
    //         system: $Enums.ExternalSystem.ezCater,
    //         level: $Enums.IntegrationRequirementLevel.Company,
    //         assets: [],
    //       },
    //     ],
    //     event: $Enums.IntegrationEvent.ezCaterOrderReceived,
    //   };
    //   const mockCompanyIntegration = { id: 'integration-id' };

    //   jest
    //     .spyOn(prismaClient.integrationTemplate, 'findUniqueOrThrow')
    //     .mockResolvedValueOnce(mockIntegrationTemplate as any);

    //   const mockMenu_1 = { id: 10 },
    //     mockMenu_2 = { id: 11 };
    //   const mockMenus = [mockMenu_1, mockMenu_2] as CompanyMenu[];
    //   jest
    //     .spyOn(prismaClient.companyMenu, 'findMany')
    //     .mockResolvedValue(mockMenus);
    //   const createSpy = jest
    //     .spyOn(prismaClient.companyIntegration, 'create')
    //     .mockResolvedValueOnce(mockCompanyIntegration as any);

    //   const result = await service.createIntegration(
    //     companyId,
    //     templateId,
    //     creatorId,
    //   );

    //   expect(result.companyIntegration).toEqual(mockCompanyIntegration);
    //   expect(
    //     prismaClient.integrationTemplate.findUniqueOrThrow,
    //   ).toHaveBeenCalledWith({
    //     where: { id: templateId },
    //     include: {
    //       requirements: {
    //         include: {
    //           assets: {
    //             where: { companyId },
    //             select: {
    //               id: true,
    //               menuId: true,
    //             },
    //           },
    //         },
    //       },
    //     },
    //   });
    //   expect(prismaClient.companyIntegration.create).toHaveBeenCalledWith({
    //     data: {
    //       companyId,
    //       templateId,
    //       event: $Enums.IntegrationEvent.ezCaterOrderReceived,
    //       creatorId,
    //       assets: {
    //         connect: [{ id: '1' }],
    //         create: [
    //           {
    //             companyId,
    //             creatorId,
    //             integrationRequirementId: 2,
    //             system: $Enums.ExternalSystem.ezCater,
    //             type: $Enums.IntegrationAssetType.API_CREDENTIAL_API_KEY,
    //           },
    //         ],
    //       },
    //     },
    //     include: { assets: true },
    //   });

    //   // Ensure no menuIds
    //   expect(createSpy).not.toHaveBeenCalledWith(
    //     expect.objectContaining({
    //       data: expect.objectContaining({
    //         assets: expect.objectContaining({
    //           create: expect.arrayContaining([
    //             expect.objectContaining({
    //               menuId: expect.anything(),
    //             }),
    //           ]),
    //         }),
    //       }),
    //     }),
    //   );
    // });

    it('should create a company integration successfully if no menus & menu requirements', async () => {
      const mockMenu_1 = { id: 10 },
        mockMenu_2 = { id: 11 };
      const mockIntegrationTemplate = {
        requirements: [
          {
            id: 1,
            level: $Enums.IntegrationRequirementLevel.Menu,
            type: $Enums.IntegrationAssetType.DATA_MAP,
            system: undefined,
            // Two existing assets which reference the same requirement (obviously), but differ in menuId
            // Should connect two
            assets: [
              { id: '1', integrationRequirementId: 1, menuId: mockMenu_1.id },
              { id: '2', integrationRequirementId: 1, menuId: mockMenu_2.id },
            ],
          },
          {
            id: 2,
            level: $Enums.IntegrationRequirementLevel.Menu,
            type: $Enums.IntegrationAssetType.DATA_MAP,
            system: undefined,
            assets: [
              // One exist asset which references the requirement. Should connect one and create one
              { id: '3', integrationRequirementId: 2, menuId: mockMenu_1.id },
            ],
          },
          {
            id: 3,
            level: $Enums.IntegrationRequirementLevel.Menu,
            system: undefined,
            type: $Enums.IntegrationAssetType.DATA_MAP,
            // Empty array - should create two assets
            assets: [],
          },
        ],
        event: $Enums.IntegrationEvent.ezCaterOrderReceived,
      };
      const mockCompanyIntegration = { id: 'integration-id' };

      jest
        .spyOn(prismaClient.integrationTemplate, 'findUniqueOrThrow')
        .mockResolvedValueOnce(mockIntegrationTemplate as any);

      jest.spyOn(prismaClient.companyMenu, 'findMany').mockResolvedValue([]);
      jest
        .spyOn(prismaClient.companyIntegration, 'create')
        .mockResolvedValueOnce(mockCompanyIntegration as any);

      const result = await service.createIntegration(
        companyId,
        templateId,
        creatorId,
      );

      expect(result.companyIntegration).toEqual(mockCompanyIntegration);
      expect(result.invalidMenuRequirements).toHaveLength(3);
      expect(result.invalidMenuRequirements).toEqual(
        expect.arrayContaining(
          mockIntegrationTemplate.requirements.map(({ id, type, system }) => ({
            id,
            type,
            system,
          })),
        ),
      );
    });

    it('should throw an InvalidUUIDError if companyId is not a valid UUID', async () => {
      const invalidCompanyId = 'invalid-uuid';

      await expect(
        service.createIntegration(invalidCompanyId, templateId, creatorId),
      ).rejects.toThrow(InvalidUUIDError);
    });

    it('should throw an error if integrationTemplate is not found', async () => {
      // Code is P2025 - in case I decide to iuse it later
      const error = new Error('Integration template not found');
      jest
        .spyOn(prismaClient.integrationTemplate, 'findUniqueOrThrow')
        .mockRejectedValueOnce(error);

      await expect(
        service.createIntegration(companyId, templateId, creatorId),
      ).rejects.toThrow(error);
    });

    // Leaving it here, but as of now, a company integration will always include full assets
    // it('should create a company integration with no existing assets', async () => {
    //   const mockIntegration = {
    //     requirements: [{ assets: [] }, { assets: [] }],
    //     event: $Enums.IntegrationEvent.ezCaterOrderReceived,
    //   };
    //   const mockCompanyIntegration = { id: 'integration-id' };

    //   jest
    //     .spyOn(prismaClient.integrationTemplate, 'findUniqueOrThrow')
    //     .mockResolvedValueOnce(mockIntegration as any);
    //   jest
    //     .spyOn(prismaClient.companyIntegration, 'create')
    //     .mockResolvedValueOnce(mockCompanyIntegration as any);

    //   const result = await service.createIntegration(
    //     companyId,
    //     templateId,
    //     creatorId,
    //   );

    //   expect(result.companyIntegration).toEqual(mockCompanyIntegration);
    //   expect(prismaClient.companyIntegration.create).toHaveBeenCalledWith({
    //     data: {
    //       companyId,
    //       templateId,
    //       event: $Enums.IntegrationEvent.ezCaterOrderReceived,
    //       creatorId,
    //     },
    //   });
    // });

    // it('should create a company integration with no existing assets', async () => {
    //   const existingAssetId = 'existing-asset-id';
    //   const mockIntegrationTemplate = {
    //     requirements: [
    //       { assets: [{ id: existingAssetId } as any] },
    //       { assets: [] },
    //     ],
    //     event: $Enums.IntegrationEvent.ezCaterOrderReceived,
    //   };
    //   const mockCompanyIntegration = { id: 'integration-id' };

    //   jest
    //     .spyOn(prismaClient.integrationTemplate, 'findUniqueOrThrow')
    //     .mockResolvedValueOnce(mockIntegrationTemplate as any);
    //   jest
    //     .spyOn(prismaClient.companyIntegration, 'create')
    //     .mockResolvedValueOnce(mockCompanyIntegration as any);

    //   const result = await service.createIntegration(
    //     companyId,
    //     templateId,
    //     creatorId,
    //   );

    //   expect(result.companyIntegration).toEqual(mockCompanyIntegration);
    //   expect(prismaClient.companyIntegration.create).toHaveBeenCalledWith({
    //     data: {
    //       companyId,
    //       templateId,
    //       event: $Enums.IntegrationEvent.ezCaterOrderReceived,
    //       creatorId,
    //       assets: {
    //         connect: [{ id: existingAssetId }],
    //       },
    //     },
    //     include: {
    //       assets: true,
    //     },
    //   });
    // });
  });
});
