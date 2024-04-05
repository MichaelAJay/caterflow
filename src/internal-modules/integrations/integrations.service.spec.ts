import { Test, TestingModule } from '@nestjs/testing';
import { IntegrationsService } from './integrations.service';
import { SystemIntegrationDbHandlerService } from '../external-handlers/db-handlers/catering-company-db-handler/system-integration-db-handler.service';
import { mockSystemIntegrationDbHandler } from '../../../test/mocks/providers/mock_system_integration_db_handler';
import { IntegrationsMapperService } from './integrations-mapper.service';
import { mockIntegrationsMapper } from '../../../test/mocks/providers/mock_integrations_mapper_service';

describe('IntegrationService', () => {
  let service: IntegrationsService;
  let systemIntegrationDbHandler: SystemIntegrationDbHandlerService;
  let integrationsMapper: IntegrationsMapperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IntegrationsService,
        {
          provide: SystemIntegrationDbHandlerService,
          useValue: mockSystemIntegrationDbHandler,
        },
        {
          provide: IntegrationsMapperService,
          useValue: mockIntegrationsMapper,
        },
      ],
    }).compile();

    service = module.get<IntegrationsService>(IntegrationsService);
    systemIntegrationDbHandler = module.get<SystemIntegrationDbHandlerService>(
      SystemIntegrationDbHandlerService,
    );
    integrationsMapper = module.get<IntegrationsMapperService>(
      IntegrationsMapperService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
