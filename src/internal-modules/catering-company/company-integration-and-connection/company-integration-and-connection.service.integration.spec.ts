import { Test, TestingModule } from '@nestjs/testing';
import { CompanyIntegrationAndConnectionService } from './company-integration-and-connection.service';
import { CompanyExternalSystemService } from '../company-external-system/company-external-system.service';
import { PrismaClientService } from '../../../external-modules/prisma-client/prisma-client.service';
import { IntegrationPrismaClientService } from '../../../../test/classes/integration-prisma-client-service.mock-provider';
import { ExternalSystemHandlerModule } from '../../external-handlers/external-system-handler/external-system-handler.module';
import { CateringCompanyDbHandlerModule } from '../../external-handlers/db-handlers/catering-company-db-handler/catering-company-db-handler.module';
import { CryptoModule } from '../../../system/modules/crypto/crypto.module';
import { ConfigModule } from '@nestjs/config';
import testConfig from '../../../../test/configuration.test';
import { $Enums, ExternalSystem } from '@prisma/client';
import { CateringCompanyDbHandlerService } from '../../external-handlers/db-handlers/catering-company-db-handler/catering-company-db-handler.service';
import { SystemIntegrationDbHandlerService } from '../../external-handlers/db-handlers/catering-company-db-handler/system-integration-db-handler.service';
import { Asset } from '../../external-handlers/db-handlers/catering-company-db-handler/types/company_connection_assets';

describe('CompanyIntegrationAndConnectionService', () => {
  let service: CompanyIntegrationAndConnectionService;
  let integrationPrismaClient: IntegrationPrismaClientService;
  let cateringCompanyDbHandler: CateringCompanyDbHandlerService;
  let systemIntegrationDbHandler: SystemIntegrationDbHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [testConfig],
          isGlobal: true,
        }),
        ExternalSystemHandlerModule,
        CateringCompanyDbHandlerModule,
        CryptoModule,
      ],
      providers: [
        CompanyIntegrationAndConnectionService,
        CompanyExternalSystemService,
        {
          provide: PrismaClientService,
          useClass: IntegrationPrismaClientService,
        },
      ],
    }).compile();

    service = module.get<CompanyIntegrationAndConnectionService>(
      CompanyIntegrationAndConnectionService,
    );
    integrationPrismaClient =
      module.get<IntegrationPrismaClientService>(PrismaClientService);
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
    // const EXTERNAL_SYSTEM_DB_RECORDS: ExternalSystem[] = [
    //   {
    //     name: 'EZ_CATER',
    //     uiName: 'ezCater',
    //     uiDescription: 'Catering company',
    //     requirements: {
    //       API_KEY: {
    //         uiName: 'API Key',
    //         isSecret: true,
    //         direction: 'OUT',
    //         uiDescription: 'An api key',
    //       },
    //       WEBHOOK_SECRET: {
    //         uiName: 'Webhook Secret',
    //         isSecret: true,
    //         direction: 'IN',
    //         uiDescription: 'Use to validate incoming order',
    //       },
    //     },
    //   },
    //   {
    //     name: 'NUTSHELL',
    //     uiName: 'Nutshell',
    //     uiDescription: 'CRM',
    //     requirements: {
    //       API_KEY: {
    //         uiName: 'API Key',
    //         isSecret: true,
    //         direction: 'OUT',
    //         uiDescription: 'An api key',
    //       },
    //       API_USERNAME: {
    //         uiName: 'API Username',
    //         isSecret: true,
    //         direction: 'OUT',
    //         uiDescription: 'Username (email) to use to make request',
    //       },
    //     },
    //   },
    //   {
    //     name: 'TEST_NO_INBOUND_NO_OUTBOUND',
    //     uiName: 'no assets',
    //     uiDescription: '',
    //     requirements: {},
    //   },
    //   {
    //     name: 'TEST_NO_INBOUND',
    //     uiName: 'no inbound',
    //     uiDescription: '',
    //     requirements: {
    //       API_KEY: {
    //         uiName: 'API Key',
    //         isSecret: true,
    //         direction: 'OUT',
    //         uiDescription: 'An api key',
    //       },
    //     },
    //   },
    //   {
    //     name: 'TEST_NO_OUTBOUND',
    //     uiName: 'no outbound',
    //     uiDescription: '',
    //     requirements: {
    //       WEBHOOK_SECRET: {
    //         uiName: 'Webhook Secret',
    //         isSecret: true,
    //         direction: 'IN',
    //         uiDescription: 'Use to validate incoming order',
    //       },
    //     },
    //   },
    //   {
    //     name: 'TEST_NO_OUTBOUND_CONFIG',
    //     uiName: 'no outbound config',
    //     uiDescription: '',
    //     requirements: {
    //       API_KEY: {
    //         uiName: 'API Key',
    //         isSecret: true,
    //         direction: 'OUT',
    //         uiDescription: 'An api key',
    //       },
    //     },
    //   },
    //   {
    //     name: 'TEST_NO_INBOUND_CONFIG',
    //     uiName: 'no inbound config',
    //     uiDescription: '',
    //     requirements: {
    //       API_KEY: {
    //         uiName: 'API Key',
    //         isSecret: true,
    //         direction: 'OUT',
    //         uiDescription: 'An api key',
    //       },
    //     },
    //   },
    // ];

    // describe('existing inbound & outbound assets', () => {
    //   let targetSystem: ExternalSystem | undefined;
    //   beforeEach(() => {
    //     targetSystem = EXTERNAL_SYSTEM_DB_RECORDS.find(
    //       (system) => system.name === $Enums.ExternalSystemName.EZ_CATER,
    //     );
    //   });

    //   it('creates record with outboundStatus & inboundStatus "UNCONFIGURED"', async () => {
    //     if (!targetSystem) {
    //       throw new Error('Target system not found');
    //     }
    //   });
    //   it('does not call testConnectionOutAndUpdate', async () => {});
    // });
    // describe('existing inbound assets only', () => {
    //   let targetSystem: ExternalSystem | undefined;
    //   beforeEach(() => {
    //     targetSystem = EXTERNAL_SYSTEM_DB_RECORDS.find(
    //       (system) =>
    //         system.name === $Enums.ExternalSystemName.TEST_NO_OUTBOUND,
    //     );
    //   });
    //   it('creates record with outboundStatus "CONFIGURED_UNTESTED"', async () => {});
    //   it('calls testConnectionOutAndUpdate with correct args', async () => {});
    //   describe('test result tested', () => {
    //     // In each case, must call update method with outboundStatus & assets ONLY
    //     it('automatically returns record with outboundStatus "READY" & asset statuses "TEST_SUCCEED" if no test required', async () => {
    //       // This case is for when outbound requests are possibly, but don't require any configuration assets
    //       targetSystem = EXTERNAL_SYSTEM_DB_RECORDS.find(
    //         (system) =>
    //           system.name ===
    //           $Enums.ExternalSystemName.TEST_NO_OUTBOUND_CONFIG_REQUIRED,
    //       );
    //       if (!targetSystem) {
    //         throw new Error('Target system not found');
    //       }
    //     });
    //     it('returns record with outboundStatus "READY" & asset statuses "TEST_SUCCEED" on test pass', async () => {
    //       targetSystem = EXTERNAL_SYSTEM_DB_RECORDS.find(
    //         (system) => system.name === $Enums.ExternalSystemName.EZ_CATER,
    //       );
    //       if (!targetSystem) {
    //         throw new Error('Target system not found');
    //       }
    //     });
    //     it('returns record with outboundStatus "TEST_FAILED" & asset status "TEST_FAILED" on test fail', async () => {
    //       targetSystem = EXTERNAL_SYSTEM_DB_RECORDS.find(
    //         (system) => system.name === $Enums.ExternalSystemName.EZ_CATER,
    //       );
    //       if (!targetSystem) {
    //         throw new Error('Target system not found');
    //       }
    //     });
    //   });
    //   describe('test result not tested & reason is "NOT_APPLICABLE"', () => {
    //     // This is for when a connection may not make outbound requests at all
    //     // Calls update method with outboundStatus ONLY
    //     it('returns record with outboundStatus "NA" & no outbound assets', async () => {
    //       targetSystem = EXTERNAL_SYSTEM_DB_RECORDS.find(
    //         (system) =>
    //           system.name ===
    //           $Enums.ExternalSystemName.TEST_NO_OUTBOUND_ALLOWED,
    //       );
    //       if (!targetSystem) {
    //         throw new Error('Target system not found');
    //       }
    //     });
    //   });
    //   describe('error state (neither test result tests OR not tested & reason "NOT_APPLICABLE")', () => {});
    // });
    describe('ezcater', () => {
      let ezCaterSystem: ExternalSystem | undefined;
      beforeEach(async () => {
        ezCaterSystem =
          await integrationPrismaClient.externalSystem.findUniqueOrThrow({
            where: { name: $Enums.ExternalSystemName.EZ_CATER },
          });
      });
      it('full test expectation with pass', async () => {
        if (!ezCaterSystem) {
          throw new Error('Target system not found');
        }

        // relevant spies
        jest.spyOn(systemIntegrationDbHandler, 'getExternalSystem');
        jest.spyOn(cateringCompanyDbHandler, 'createExternalSystemConnection');
        jest.spyOn(service, 'testConnectionOutAndUpdate');
        jest.spyOn(
          integrationPrismaClient.companyExternalSystemConnection,
          'create',
        );

        const mockCompanyId = '5ba4ac31-aaef-475b-af1b-868748700737'; // has to be any uuid
        const systemName = $Enums.ExternalSystemName.EZ_CATER;
        const result = await service.createExternalSystemConnection(
          mockCompanyId,
          systemName,
        );

        // Assert that getExternalSystem is called with correct args
        expect(
          systemIntegrationDbHandler.getExternalSystem,
        ).toHaveBeenCalledWith(systemName, mockCompanyId);

        // Add assertions for the inner workings of getExternalSystem

        const mappedAssets: Partial<
          Record<'API_KEY' | 'API_USERNAME' | 'WEBHOOK_SECRET', Asset>
        > = {
          API_KEY: {
            uiName: 'API Key',
            isSecret: true,
            direction: 'OUT',
            uiDescription: 'An api key',
            status: 'UNCONFIGURED',
          },
          WEBHOOK_SECRET: {
            uiName: 'Webhook Secret',
            isSecret: true,
            direction: 'IN',
            uiDescription: 'Use to validate incoming order',
            status: 'UNCONFIGURED',
          },
        };
        expect(
          cateringCompanyDbHandler.createExternalSystemConnection,
        ).toHaveBeenCalledWith(
          mockCompanyId,
          systemName,
          ezCaterSystem.uiName,
          mappedAssets,
        );

        // Assert that both outboundStatus & inboundStatus are 'UNCONFIGURED' for the create call.
        expect(
          integrationPrismaClient.companyExternalSystemConnection.create,
        ).toHaveBeenCalledWith({
          data: {
            companyId: mockCompanyId,
            systemName,
            systemUIName: ezCaterSystem.uiName,
            outboundStatus: $Enums.ConnectionStatus.UNCONFIGURED,
            inboundStatus: $Enums.ConnectionStatus.UNCONFIGURED,
            assets: mappedAssets,
          },
        });

        // Assert that the response from that has outboundStatus 'unconfigured', which indicates that there were outbound assets
        // As a corollary to the above, assert that testConnectionOutAndUpdate is NOT called
        expect(service.testConnectionOutAndUpdate).not.toHaveBeenCalled();
        expect(result).toEqual({
          id: 'mock-id', // from the overridden implementation in integrationPrismaClient
          companyId: mockCompanyId,
          systemName,
          systemUIName: ezCaterSystem.uiName,
          inboundStatus: $Enums.ConnectionStatus.UNCONFIGURED,
          outboundStatus: $Enums.ConnectionStatus.UNCONFIGURED,
          assets: mappedAssets,
        });
      });
    });
    // describe('nutshell', () => {
    //   let nutshellSystem: ExternalSystem | undefined;
    //   beforeEach(async () => {
    //     nutshellSystem =
    //       await integrationPrismaClient.externalSystem.findUniqueOrThrow({
    //         where: { name: $Enums.ExternalSystemName.NUTSHELL },
    //       });
    //   });
    //   it('full test expectation with pass', async () => {
    //     if (!nutshellSystem) {
    //       throw new Error('Target system not found');
    //     }
    //   });
    //   it('full test expectation with fail', async () => {
    //     if (!nutshellSystem) {
    //       throw new Error('Target system not found');
    //     }
    //   });
    // });
  });
});
