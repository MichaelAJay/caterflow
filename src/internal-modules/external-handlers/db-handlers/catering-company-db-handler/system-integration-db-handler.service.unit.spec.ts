import { Test, TestingModule } from '@nestjs/testing';
import { SystemIntegrationDbHandlerService } from './system-integration-db-handler.service';
import { PrismaClientService } from 'src/external-modules/prisma-client/prisma-client.service';
import { SystemIntegrationDbQueryBuilderService } from './system-integration-db-query-builder.service';
import { mockPrismaClientService } from 'test/mocks/providers/mock_prisma_client';
import { mockSystemIntegrationDbQueryBuilder } from 'test/mocks/providers/mock_system_integration_db_querybuilder';
import { IBuildRetrieveIntegrationListArgs } from './interfaces/query-builder-args.interfaces';
import { Prisma } from '@prisma/client';

describe('SystemIntegrationDbHandlerService', () => {
  let service: SystemIntegrationDbHandlerService;
  let prismaClient: PrismaClientService;
  let systemIntegrationDbQueryBuilder: SystemIntegrationDbQueryBuilderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SystemIntegrationDbHandlerService,
        { provide: PrismaClientService, useValue: mockPrismaClientService },
        {
          provide: SystemIntegrationDbQueryBuilderService,
          useValue: mockSystemIntegrationDbQueryBuilder,
        },
      ],
    }).compile();

    service = module.get<SystemIntegrationDbHandlerService>(
      SystemIntegrationDbHandlerService,
    );
    prismaClient = module.get<PrismaClientService>(PrismaClientService);
    systemIntegrationDbQueryBuilder =
      module.get<SystemIntegrationDbQueryBuilderService>(
        SystemIntegrationDbQueryBuilderService,
      );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('retrieveList', () => {
    it('should call buildRetrieveIntegrationsListQueryWithoutInclude with the provided query', async () => {
      const query: IBuildRetrieveIntegrationListArgs = {
        pg: 1,
        perPage: 10,
        templateSrcSystem: 'ezCater',
        templateTargetSystem: 'Nutshell',
      };
      const expectedQueryWithoutInclude: Prisma.IntegrationTemplateFindManyArgs =
        {
          take: 10,
          where: {
            srcSystem: 'ezCater',
            targetSystem: 'Nutshell',
          },
        };

      jest
        .spyOn(
          systemIntegrationDbQueryBuilder,
          'buildRetrieveIntegrationsListQueryWithoutInclude',
        )
        .mockReturnValue(expectedQueryWithoutInclude);

      await service.retrieveList(query);

      expect(
        systemIntegrationDbQueryBuilder.buildRetrieveIntegrationsListQueryWithoutInclude,
      ).toHaveBeenCalledWith(query);
    });

    it('should call prismaClient.integrationTemplate.findMany with the correct query', async () => {
      const query: IBuildRetrieveIntegrationListArgs = {
        pg: 1,
        perPage: 10,
        templateSrcSystem: 'ezCater',
        templateTargetSystem: 'Nutshell',
      };
      const expectedQueryWithoutInclude: Prisma.IntegrationTemplateFindManyArgs =
        {
          take: 10,
          where: {
            srcSystem: 'ezCater',
            targetSystem: 'Nutshell',
          },
        };
      const expectedRecords = [{ id: 1 } as any, { id: 2 } as any];

      jest
        .spyOn(
          systemIntegrationDbQueryBuilder,
          'buildRetrieveIntegrationsListQueryWithoutInclude',
        )
        .mockReturnValue(expectedQueryWithoutInclude);
      jest
        .spyOn(prismaClient.integrationTemplate, 'findMany')
        .mockResolvedValue(expectedRecords);

      const result = await service.retrieveList(query);

      expect(prismaClient.integrationTemplate.findMany).toHaveBeenCalledWith({
        ...expectedQueryWithoutInclude,
        include: {
          requirements: true,
        },
      });
      expect(result).toEqual(expectedRecords);
    });

    it('should return the records returned by prismaClient.integrationTemplate.findMany', async () => {
      const expectedRecords = [{ id: 1 } as any, { id: 2 } as any];

      jest
        .spyOn(prismaClient.integrationTemplate, 'findMany')
        .mockResolvedValue(expectedRecords);

      const result = await service.retrieveList();

      expect(result).toEqual(expectedRecords);
    });
  });
});
