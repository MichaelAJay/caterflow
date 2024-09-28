import { Test, TestingModule } from '@nestjs/testing';
import { CompanyIntegrationAndConnectionService } from './company-integration-and-connection.service';
import { CompanyExternalSystemService } from '../company-external-system/company-external-system.service';

import { CryptoService } from '../../../system/modules/crypto/crypto.service';
import { PrismaClientService } from '../../../external-modules/prisma-client/prisma-client.service';
import { IntegrationPrismaClientService } from '../../../../test/classes/integration-prisma-client-service.mock-provider';

import { ExternalSystemHandlerModule } from '../../external-handlers/external-system-handler/external-system-handler.module';
import { CateringCompanyDbHandlerModule } from '../../external-handlers/db-handlers/catering-company-db-handler/catering-company-db-handler.module';
import { CryptoModule } from '../../../system/modules/crypto/crypto.module';
import { ConfigModule } from '@nestjs/config';
import testConfig from '../../../../test/configuration.test';

describe('CompanyIntegrationAndConnectionService', () => {
  let service: CompanyIntegrationAndConnectionService;

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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
