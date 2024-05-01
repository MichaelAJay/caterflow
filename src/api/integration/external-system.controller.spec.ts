import { Test, TestingModule } from '@nestjs/testing';
import { ExternalSystemController } from './external-system.controller';
import { IntegrationsService } from '../../internal-modules/integrations/integrations.service';
import { mockIntegrationsService } from '../../../test/mocks/providers/mock_integrations_service';

describe('ExternalSystemController', () => {
  let controller: ExternalSystemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExternalSystemController],
      providers: [
        {
          provide: IntegrationsService,
          useValue: mockIntegrationsService,
        },
      ],
    }).compile();

    controller = module.get<ExternalSystemController>(ExternalSystemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
