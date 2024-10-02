import { Test, TestingModule } from '@nestjs/testing';
import { CompanyIntegrationAndConnectionService } from './company-integration-and-connection.service';
import { CompanyExternalSystemService } from '../company-external-system/company-external-system.service';
import { PrismaClientService } from '../../../external-modules/prisma-client/prisma-client.service';
import { ExternalSystemHandlerModule } from '../../external-handlers/external-system-handler/external-system-handler.module';
import { CateringCompanyDbHandlerModule } from '../../external-handlers/db-handlers/catering-company-db-handler/catering-company-db-handler.module';
import { CryptoModule } from '../../../system/modules/crypto/crypto.module';
import { ConfigModule } from '@nestjs/config';
import testConfig from '../../../../test/configuration.test';
import { $Enums, CateringCompany, ExternalSystem, User } from '@prisma/client';
import { CateringCompanyDbHandlerService } from '../../external-handlers/db-handlers/catering-company-db-handler/catering-company-db-handler.service';
import { SystemIntegrationDbHandlerService } from '../../external-handlers/db-handlers/catering-company-db-handler/system-integration-db-handler.service';
import { Asset } from '../../external-handlers/db-handlers/catering-company-db-handler/types/company_connection_assets';

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
  let targetCompanyId: string;

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
      targetCompanyId = company.id;
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
            targetCompanyId,
            systemName,
          );
          recordsToDelete.companyConnectionIds.push(result.id);

          // Assert that getExternalSystem is called with correct args
          expect(
            systemIntegrationDbHandler.getExternalSystem,
          ).toHaveBeenCalledWith(systemName, targetCompanyId);
        });
      });
    };

    describe('ezcater', () => {
      let targetSystem: ExternalSystem | undefined;
      beforeEach(async () => {
        targetSystem = await prismaClient.externalSystem.findUniqueOrThrow({
          where: { name: $Enums.ExternalSystemName.EZ_CATER },
        });
      });
      it('full test expectation with pass', async () => {
        if (!targetSystem) {
          throw new Error('Target system not found');
        }

        // relevant spies
        jest.spyOn(systemIntegrationDbHandler, 'getExternalSystem');
        jest.spyOn(cateringCompanyDbHandler, 'createExternalSystemConnection');
        jest.spyOn(service, 'testConnectionOutAndUpdate');

        const systemName = $Enums.ExternalSystemName.EZ_CATER;
        const result = await service.createExternalSystemConnection(
          targetCompanyId,
          systemName,
        );
        recordsToDelete.companyConnectionIds.push(result.id);

        // Assert that getExternalSystem is called with correct args
        expect(
          systemIntegrationDbHandler.getExternalSystem,
        ).toHaveBeenCalledWith(systemName, targetCompanyId);

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
          targetCompanyId,
          systemName,
          targetSystem.uiName,
          mappedAssets,
        );

        expect(service.testConnectionOutAndUpdate).not.toHaveBeenCalled();
        expect(result).toEqual({
          id: expect.any(String),
          companyId: targetCompanyId,
          systemName,
          systemUIName: targetSystem.uiName,
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
