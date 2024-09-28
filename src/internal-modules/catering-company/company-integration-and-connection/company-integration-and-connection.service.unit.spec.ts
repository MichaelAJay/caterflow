import { Test, TestingModule } from '@nestjs/testing';
import { CompanyIntegrationAndConnectionService } from './company-integration-and-connection.service';
import { CompanyExternalSystemService } from '../company-external-system/company-external-system.service';
import { CateringCompanyDbHandlerService } from 'src/internal-modules/external-handlers/db-handlers/catering-company-db-handler/catering-company-db-handler.service';
import { CryptoService } from 'src/system/modules/crypto/crypto.service';
import { PrismaClientService } from 'src/external-modules/prisma-client/prisma-client.service';
import { IntegrationPrismaClientService } from 'test/classes/integration-prisma-client-service.mock-provider';

describe('CompanyIntegrationAndConnectionService', () => {
  let service: CompanyIntegrationAndConnectionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyIntegrationAndConnectionService,
        CompanyExternalSystemService,
        CateringCompanyDbHandlerService,
        CryptoService,
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
