import { Test, TestingModule } from '@nestjs/testing';
import { CompanyIntegrationAndConnectionService } from './company-integration-and-connection.service';
import { CompanyExternalSystemService } from '../company-external-system/company-external-system.service';
import { PrismaClientService } from '../../../external-modules/prisma-client/prisma-client.service';
import { ExternalSystemHandlerModule } from '../../external-handlers/external-system-handler/external-system-handler.module';
import { CateringCompanyDbHandlerModule } from '../../external-handlers/db-handlers/catering-company-db-handler/catering-company-db-handler.module';
import { CryptoModule } from '../../../system/modules/crypto/crypto.module';
import { ConfigModule } from '@nestjs/config';
import testConfig from '../../../../test/configuration.test';
import {
  $Enums,
  CateringCompany,
  ExternalSystem,
  IntegrationTemplate,
  User,
} from '@prisma/client';
import { CateringCompanyDbHandlerService } from '../../external-handlers/db-handlers/catering-company-db-handler/catering-company-db-handler.service';
import { SystemIntegrationDbHandlerService } from '../../external-handlers/db-handlers/catering-company-db-handler/system-integration-db-handler.service';
import {
  Asset,
  AssetStatus,
} from '../../external-handlers/db-handlers/catering-company-db-handler/types/company_connection_assets';
import { connectionDirection } from '../../external-handlers/db-handlers/catering-company-db-handler/types/external_systems_requirements';

describe('CompanyIntegrationAndConnectionService', () => {
  let service: CompanyIntegrationAndConnectionService;
  let cateringCompanyDbHandler: CateringCompanyDbHandlerService;
  let systemIntegrationDbHandler: SystemIntegrationDbHandlerService;
  const recordsToDelete = {
    userIds: [] as string[],
    companyIds: [] as string[],
    companyConnectionIds: [] as string[],
  };
  let user: User;
  let company: CateringCompany;
  const prismaClient = new PrismaClientService();

  beforeAll(async () => {
    try {
      user = await prismaClient.user.create({
        data: {
          extAuthUID: 'mocked external auth uid',
          emailEncrypted: 'mock encrypted email',
          emailHashed: 'mock hashed email',
          nameEncrypted: 'Encrypted Username',
        },
      });

      company = await prismaClient.cateringCompany.create({
        data: {
          name: 'Mock Company',
          isActive: true,
          ownerId: user.id,
        },
      });

      user = await prismaClient.user.update({
        where: { id: user.id },
        data: {
          companyId: company.id,
        },
      });

      recordsToDelete.userIds.push(user.id);
      recordsToDelete.companyIds.push(company.id);
    } catch (err) {
      console.error(err);
      throw err;
    }
  });
  afterAll(async () => {
    try {
      const { userIds, companyIds, companyConnectionIds } = recordsToDelete;
      await prismaClient.$transaction([
        prismaClient.companyExternalSystemConnection.deleteMany({
          where: { id: { in: companyConnectionIds } },
        }),
        prismaClient.cateringCompany.deleteMany({
          where: { id: { in: companyIds } },
        }),
        prismaClient.user.deleteMany({
          where: { id: { in: userIds } },
        }),
      ]);
      console.log('Records successfully deleted');
    } catch (err) {
      console.error(err);
      throw err;
    }
  });

  beforeEach(async () => {
    // const mockPrismaClientService = new IntegrationPrismaClientService();
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [testConfig],
          isGlobal: true,
        }),
        ExternalSystemHandlerModule,
        CateringCompanyDbHandlerModule,
        // CateringCompanyDbHandlerModule.forTesting({
        //   prismaClientService: mockPrismaClientService,
        // }),
        CryptoModule,
      ],
      providers: [
        CompanyIntegrationAndConnectionService,
        CompanyExternalSystemService,
        // {
        //   provide: PrismaClientService,
        //   useValue: mockPrismaClientService,
        // },
      ],
    }).compile();

    service = module.get<CompanyIntegrationAndConnectionService>(
      CompanyIntegrationAndConnectionService,
    );
    cateringCompanyDbHandler = module.get<CateringCompanyDbHandlerService>(
      CateringCompanyDbHandlerService,
    );
    systemIntegrationDbHandler = module.get<SystemIntegrationDbHandlerService>(
      SystemIntegrationDbHandlerService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createExternalSystemConnection', () => {
    const createExternalSystemConnectionTester = (
      systemName: $Enums.ExternalSystemName,
      mappedAssets: Partial<
        Record<'API_KEY' | 'API_USERNAME' | 'WEBHOOK_SECRET', Asset>
      >,
      expectedInboundStatus: $Enums.ConnectionStatus,
      expectedOutboundStatus: $Enums.ConnectionStatus,
    ) => {
      describe(`${systemName}`, () => {
        let targetSystem: ExternalSystem | undefined;
        beforeEach(async () => {
          targetSystem = await prismaClient.externalSystem.findUniqueOrThrow({
            where: { name: systemName },
          });
        });

        it('should pass this test', async () => {
          if (!targetSystem) {
            throw new Error('Target system not found');
          }

          // relevant spies
          jest.spyOn(systemIntegrationDbHandler, 'getExternalSystem');
          jest.spyOn(
            cateringCompanyDbHandler,
            'createExternalSystemConnection',
          );
          jest.spyOn(service, 'testConnectionOutAndUpdate');

          const result = await service.createExternalSystemConnection(
            company.id,
            systemName,
          );
          recordsToDelete.companyConnectionIds.push(result.id);

          // Assert that getExternalSystem is called with correct args
          expect(
            systemIntegrationDbHandler.getExternalSystem,
          ).toHaveBeenCalledWith(systemName, company.id);

          expect(
            cateringCompanyDbHandler.createExternalSystemConnection,
          ).toHaveBeenCalledWith(
            company.id,
            systemName,
            targetSystem.uiName,
            mappedAssets,
          );

          expect(service.testConnectionOutAndUpdate).not.toHaveBeenCalled();
          expect(result).toEqual({
            id: expect.any(String),
            companyId: company.id,
            systemName,
            systemUIName: targetSystem.uiName,
            inboundStatus: expectedInboundStatus,
            outboundStatus: expectedOutboundStatus,
            assets: mappedAssets,
          });
        });
      });
    };

    /**
     * These hard-coded values ensure that the asset mapper utility works as expected in the scope of the integration test
     */
    const ezCater_mappedAssets: Partial<
      Record<'API_KEY' | 'API_USERNAME' | 'WEBHOOK_SECRET', Asset>
    > = {
      API_KEY: {
        uiName: 'API Key',
        isSecret: true,
        direction: connectionDirection.Out,
        uiDescription: 'An api key',
        status: AssetStatus.Unconfigured,
      },
      WEBHOOK_SECRET: {
        uiName: 'Webhook Secret',
        isSecret: true,
        direction: connectionDirection.In,
        uiDescription: 'Use to validate incoming order',
        status: AssetStatus.Unconfigured,
      },
    };
    const nutshell_mappedAssets: Partial<
      Record<'API_KEY' | 'API_USERNAME' | 'WEBHOOK_SECRET', Asset>
    > = {
      API_KEY: {
        uiName: 'API Key',
        isSecret: true,
        direction: connectionDirection.Out,
        uiDescription: 'An api key',
        status: AssetStatus.Unconfigured,
      },
      API_USERNAME: {
        uiName: 'API Username',
        isSecret: true,
        direction: connectionDirection.Out,
        uiDescription: 'Username (email) to use to make request',
        status: AssetStatus.Unconfigured,
      },
    };

    createExternalSystemConnectionTester(
      $Enums.ExternalSystemName.EZ_CATER,
      ezCater_mappedAssets,
      $Enums.ConnectionStatus.UNCONFIGURED,
      $Enums.ConnectionStatus.UNCONFIGURED,
    );

    createExternalSystemConnectionTester(
      $Enums.ExternalSystemName.NUTSHELL,
      nutshell_mappedAssets,
      $Enums.ConnectionStatus.CONFIGURED_UNTESTED,
      $Enums.ConnectionStatus.UNCONFIGURED,
    );
  });

  describe('createIntegration', () => {
    const createIntegrationTester = (
      integrationId: number,
      integrationName: 'ezCater Order to Nutshell Lead', // this should be a string literal
    ) => {
      describe(`${integrationName}`, () => {
        let targetIntegration: IntegrationTemplate | undefined;
        beforeEach(async () => {
          targetIntegration =
            await prismaClient.integrationTemplate.findUniqueOrThrow({
              where: { id: integrationId },
            });
        });

        it('should pass this test', async () => {
          if (!targetIntegration) {
            throw new Error('Target integration not found');
          }
        });

        /**
         * To test:
         * Create source & target
         * Create just source
         * Create just target
         * Think about all of the various permutations of source & target configurations
         */
      });
    };

    createIntegrationTester(1, 'ezCater Order to Nutshell Lead');
  });
});
