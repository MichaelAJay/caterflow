import { Test, TestingModule } from '@nestjs/testing';
import { IntegrationController } from './integration.controller';
import { IntegrationsService } from '../../internal-modules/integrations/integrations.service';

describe('IntegrationController', () => {
  let controller: IntegrationController;
  let integrationService: IntegrationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IntegrationController],
      providers: [IntegrationsService], // needs mock
    }).compile();

    controller = module.get<IntegrationController>(IntegrationController);
    integrationService = module.get<IntegrationsService>(IntegrationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(true).toBe(false); // calls attention to need for mock
  });
});
