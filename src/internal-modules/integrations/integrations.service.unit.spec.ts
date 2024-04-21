import { Test, TestingModule } from '@nestjs/testing';
import { IntegrationsService } from './integrations.service';
import { SystemIntegrationDbHandlerService } from '../external-handlers/db-handlers/catering-company-db-handler/system-integration-db-handler.service';
import { mockSystemIntegrationDbHandler } from '../../../test/mocks/providers/mock_system_integration_db_handler';
import { mockIntegrationsMapper } from '../../../test/mocks/providers/mock_integrations_mapper_service';
import { IntegrationsMapperService } from './integrations-mapper.service';
import { IBuildRetrieveIntegrationListArgs } from '../external-handlers/db-handlers/catering-company-db-handler/interfaces/query-builder-args.interfaces';

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

  describe('getSystemIntegrations', () => {
    it('should call db handler with correct argument if provided', async () => {
      const validQuery: IBuildRetrieveIntegrationListArgs = {
        perPage: 5,
        pg: 2,
      };
      await service.getSystemIntegrations(validQuery);
      expect(
        systemIntegrationDbHandler.getSystemIntegrations,
      ).toHaveBeenCalledWith(validQuery);
    });
    it('should call db handler with undefined argument if no arguments provided', async () => {
      await service.getSystemIntegrations();
      expect(
        systemIntegrationDbHandler.getSystemIntegrations,
      ).toHaveBeenCalledWith(undefined);
    });
    it('should throw any error thrown from dbhandler', async () => {
      const testError = new Error('Test Error');
      jest
        .spyOn(systemIntegrationDbHandler, 'getSystemIntegrations')
        .mockRejectedValue(testError);
      await expect(service.getSystemIntegrations()).rejects.toThrow(testError);
    });
    // it('should map data for response', async () => {
    //   // Data mapper not written
    //   expect(true).toBe(false);
    // });
  });
  describe('getExternalSystems', () => {
    it('should call db handler with correct argument if provided', async () => {
      const validQuery: IBuildRetrieveIntegrationListArgs = {
        perPage: 5,
        pg: 2,
      };
      await service.getExternalSystems(validQuery);
      expect(
        systemIntegrationDbHandler.getExternalSystems,
      ).toHaveBeenCalledWith(validQuery);
    });
    it('should call db handler with undefined argument if no arguments provided', async () => {
      await service.getExternalSystems();
      expect(
        systemIntegrationDbHandler.getExternalSystems,
      ).toHaveBeenCalledWith(undefined);
    });
    it('should throw any error thrown from dbhandler', async () => {
      const testError = new Error('Test Error');
      jest
        .spyOn(systemIntegrationDbHandler, 'getExternalSystems')
        .mockRejectedValue(testError);
      await expect(service.getExternalSystems()).rejects.toThrow(testError);
    });
    // it('should map data for response', async () => {
    //   // Data mapper not written
    //   expect(true).toBe(false);
    // });
  });
});
