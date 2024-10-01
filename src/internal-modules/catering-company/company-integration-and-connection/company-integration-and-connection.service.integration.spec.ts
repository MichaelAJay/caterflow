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
    const mockPrismaClientService = new IntegrationPrismaClientService();
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [testConfig],
          isGlobal: true,
        }),
        ExternalSystemHandlerModule,
        // CateringCompanyDbHandlerModule,
        CateringCompanyDbHandlerModule.forTesting({
          prismaClientService: mockPrismaClientService,
        }),
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
        const mySpy = jest.spyOn(
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

        console.log('Spy calls', mySpy.mock.calls);
        // Assert that both outboundStatus & inboundStatus are 'UNCONFIGURED' for the create call.
        expect(mySpy).toHaveBeenCalledWith({
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
