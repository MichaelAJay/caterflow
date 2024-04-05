import { Test, TestingModule } from '@nestjs/testing';
import { IntegrationController } from './integration.controller';
import { IntegrationsService } from '../../internal-modules/integrations/integrations.service';
import { mockIntegrationsService } from '../../../test/mocks/providers/mock_integrations_service';
import { IBuildRetrieveIntegrationListArgs } from '../../internal-modules/external-handlers/db-handlers/catering-company-db-handler/interfaces/query-builder-args.interfaces';

describe('IntegrationController', () => {
  let controller: IntegrationController;
  let integrationService: IntegrationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IntegrationController],
      providers: [
        { provide: IntegrationsService, useValue: mockIntegrationsService },
      ],
    }).compile();

    controller = module.get<IntegrationController>(IntegrationController);
    integrationService = module.get<IntegrationsService>(IntegrationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getIntegrations', () => {
    it('should call integrationsService.getSystemIntegrations with the provided query parameters', async () => {
      const query: IBuildRetrieveIntegrationListArgs = {
        pg: 1,
        perPage: 10,
        templateSrcSystem: 'ezCater',
        templateTargetSystem: 'Nutshell',
      };

      await controller.getIntegrations(query);

      expect(integrationService.getSystemIntegrations).toHaveBeenCalledWith(
        query,
      );
    });

    it('should call integrationsService.getSystemIntegrations with undefined if no query parameters are provided', async () => {
      await controller.getIntegrations({});

      expect(integrationService.getSystemIntegrations).toHaveBeenCalledWith(
        undefined,
      );
    });

    it('should return the result of integrationsService.getSystemIntegrations', async () => {
      const expectedResult = [{ id: 1, name: 'Integration 1' } as any];
      jest
        .spyOn(integrationService, 'getSystemIntegrations')
        .mockResolvedValue(expectedResult);

      const result = await controller.getIntegrations({});

      expect(result).toEqual(expectedResult);
    });

    it('should handle optional query parameters correctly', async () => {
      const query = {
        pg: 1,
        perPage: 10,
      };

      await controller.getIntegrations(query);

      expect(integrationService.getSystemIntegrations).toHaveBeenCalledWith(
        query,
      );
    });

    it('should handle templateSrcSystem query parameter correctly', async () => {
      const query: IBuildRetrieveIntegrationListArgs = {
        templateSrcSystem: 'ezCater',
      };

      await controller.getIntegrations(query);

      expect(integrationService.getSystemIntegrations).toHaveBeenCalledWith(
        query,
      );
    });

    it('should handle templateTargetSystem query parameter correctly', async () => {
      const query: IBuildRetrieveIntegrationListArgs = {
        templateTargetSystem: 'Nutshell',
      };

      await controller.getIntegrations(query);

      expect(integrationService.getSystemIntegrations).toHaveBeenCalledWith(
        query,
      );
    });

    it('should handle all query parameters correctly', async () => {
      const query: IBuildRetrieveIntegrationListArgs = {
        pg: 2,
        perPage: 20,
        templateSrcSystem: 'ezCater',
        templateTargetSystem: 'ezCater',
      };

      await controller.getIntegrations(query);

      expect(integrationService.getSystemIntegrations).toHaveBeenCalledWith(
        query,
      );
    });
  });
});
