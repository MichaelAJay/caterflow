import { Test, TestingModule } from '@nestjs/testing';
import {
  CompanyMapperService,
  INTEGRATION_EVENT_MAPPER,
} from './company-mapper.service';
import { $Enums } from '@prisma/client';
import {
  CompanyIntegrationListItem,
  CompanyIntegrationOutputItem,
} from '../../common/types/company-integration-list-item.type';

describe('CompanyMapperService', () => {
  let service: CompanyMapperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompanyMapperService],
    }).compile();

    service = module.get<CompanyMapperService>(CompanyMapperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('mapCompanyIntegrationListForOutput', () => {
    it('should map company integration list items to output items correctly', () => {
      const listItems: CompanyIntegrationListItem[] = [
        {
          isConfigured: true,
          isActive: true,
          createdAt: new Date('2023-06-01'),
          template: {
            srcSystem: $Enums.ExternalSystem.ezCater,
            srcEntity: $Enums.ExternalEntity.Order,
            targetSystem: $Enums.ExternalSystem.Nutshell,
            targetEntity: $Enums.ExternalEntity.Lead,
          },
          event: $Enums.IntegrationEvent.ezCaterOrderReceived,
        } as CompanyIntegrationListItem,
        {
          isConfigured: false,
          isActive: false,
          createdAt: new Date('2023-06-02'),
          template: {
            srcSystem: $Enums.ExternalSystem.Nutshell,
            srcEntity: $Enums.ExternalEntity.Lead,
            targetSystem: $Enums.ExternalSystem.ezCater,
            targetEntity: $Enums.ExternalEntity.Order,
          },
          event: '' as $Enums.IntegrationEvent,
        } as CompanyIntegrationListItem,
      ];

      const expectedOutputItems: CompanyIntegrationOutputItem[] = [
        {
          isConfigured: true,
          isActive: true,
          createdAt: new Date('2023-06-01'),
          template: {
            src: 'ezCater Order',
            target: 'Nutshell Lead',
          },
          event: 'ezCater Order Received',
        },
        {
          isConfigured: false,
          isActive: false,
          createdAt: new Date('2023-06-02'),
          template: {
            src: 'Nutshell Lead',
            target: 'ezCater Order',
          },
          event: undefined as any,
        },
      ];

      const result = service.mapCompanyIntegrationListForOutput(listItems);

      expect(result).toEqual(expectedOutputItems);
    });

    it('should handle an empty input array', () => {
      const listItems: CompanyIntegrationListItem[] = [];

      const expectedOutputItems: CompanyIntegrationOutputItem[] = [];

      const result = service.mapCompanyIntegrationListForOutput(listItems);

      expect(result).toEqual(expectedOutputItems);
    });

    it('should map template properties correctly', () => {
      const listItems: CompanyIntegrationListItem[] = [
        {
          isConfigured: true,
          isActive: true,
          createdAt: new Date('2023-06-01'),
          template: {
            srcSystem: $Enums.ExternalSystem.ezCater,
            srcEntity: $Enums.ExternalEntity.Order,
            targetSystem: $Enums.ExternalSystem.Nutshell,
            targetEntity: $Enums.ExternalEntity.Lead,
          },
          event: $Enums.IntegrationEvent.ezCaterOrderReceived,
        } as CompanyIntegrationListItem,
      ];

      const expectedOutputItems: CompanyIntegrationOutputItem[] = [
        {
          isConfigured: true,
          isActive: true,
          createdAt: new Date('2023-06-01'),
          template: {
            src: 'ezCater Order',
            target: 'Nutshell Lead',
          },
          event: 'ezCater Order Received',
        },
      ];

      const result = service.mapCompanyIntegrationListForOutput(listItems);

      expect(result[0].template).toEqual(expectedOutputItems[0].template);
    });

    it('should map event property using the INTEGRATION_EVENT_MAPPER', () => {
      const listItems: CompanyIntegrationListItem[] = [
        {
          isConfigured: true,
          isActive: true,
          createdAt: new Date('2023-06-01'),
          template: {
            srcSystem: $Enums.ExternalSystem.ezCater,
            srcEntity: $Enums.ExternalEntity.Order,
            targetSystem: $Enums.ExternalSystem.Nutshell,
            targetEntity: $Enums.ExternalEntity.Lead,
          },
          event: $Enums.IntegrationEvent.ezCaterOrderReceived,
        } as CompanyIntegrationListItem,
      ];

      const expectedOutputItems: CompanyIntegrationOutputItem[] = [
        {
          isConfigured: true,
          isActive: true,
          createdAt: new Date('2023-06-01'),
          template: {
            src: 'EzCater.Order',
            target: 'MySystem.Order',
          },
          event: 'ezCater Order Received',
        },
      ];

      const result = service.mapCompanyIntegrationListForOutput(listItems);

      expect(result[0].event).toEqual(expectedOutputItems[0].event);
      expect(result[0].event).toEqual(
        INTEGRATION_EVENT_MAPPER[listItems[0].event],
      );
    });
  });
});
