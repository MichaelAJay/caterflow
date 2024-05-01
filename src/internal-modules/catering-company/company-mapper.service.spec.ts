import { Test, TestingModule } from '@nestjs/testing';
import {
  CompanyMapperService,
  INTEGRATION_EVENT_MAPPER,
} from './company-mapper.service';
import { $Enums } from '@prisma/client';

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

  // Will require tests
  it('should fail', () => {
    expect(true).toBe(false);
  });

  describe('mapCompanyIntegrationListForOutput', () => {
    // it('should map company integration list items to output items correctly', () => {
    //   const listItems: any[] = [
    //     {
    //       isConfigured: true,
    //       isActive: true,
    //       createdAt: new Date('2023-06-01'),
    //       template: {
    //         srcSystem: $Enums.ExternalSystemName.EZ_CATER,
    //         srcEntity: $Enums.ExternalEntity.Order,
    //         targetSystem: $Enums.ExternalSystemName.NUTSHELL,
    //         targetEntity: $Enums.ExternalEntity.Lead,
    //       },
    //       event: $Enums.IntegrationEvent.ezCaterOrderReceived,
    //     } as any,
    //     {
    //       isConfigured: false,
    //       isActive: false,
    //       createdAt: new Date('2023-06-02'),
    //       template: {
    //         srcSystem: $Enums.ExternalSystemName.NUTSHELL,
    //         srcEntity: $Enums.ExternalEntity.Lead,
    //         targetSystem: $Enums.ExternalSystemName.EZ_CATER,
    //         targetEntity: $Enums.ExternalEntity.Order,
    //       },
    //       event: '' as $Enums.IntegrationEvent,
    //     } as any,
    //   ];
    //   const expectedOutputItems: any[] = [
    //     {
    //       isConfigured: true,
    //       isActive: true,
    //       createdAt: new Date('2023-06-01'),
    //       template: {
    //         src: 'ezCater Order',
    //         target: 'Nutshell Lead',
    //       },
    //       event: 'ezCater Order Received',
    //     },
    //     {
    //       isConfigured: false,
    //       isActive: false,
    //       createdAt: new Date('2023-06-02'),
    //       template: {
    //         src: 'Nutshell Lead',
    //         target: 'ezCater Order',
    //       },
    //       event: undefined as any,
    //     },
    //   ];
    //   const result = service.mapCompanyIntegrationListForOutput(listItems);
    //   expect(result).toEqual(expectedOutputItems);
    // });
    // it('should handle an empty input array', () => {
    //   const listItems: any[] = [];
    //   const expectedOutputItems: any[] = [];
    //   const result = service.mapCompanyIntegrationListForOutput(listItems);
    //   expect(result).toEqual(expectedOutputItems);
    // });
    // it('should map template properties correctly', () => {
    //   const listItems: any[] = [
    //     {
    //       isConfigured: true,
    //       isActive: true,
    //       createdAt: new Date('2023-06-01'),
    //       template: {
    //         srcSystem: $Enums.ExternalSystemName.EZ_CATER,
    //         srcEntity: $Enums.ExternalEntity.Order,
    //         targetSystem: $Enums.ExternalSystemName.NUTSHELL,
    //         targetEntity: $Enums.ExternalEntity.Lead,
    //       },
    //       event: $Enums.IntegrationEvent.ezCaterOrderReceived,
    //     } as any,
    //   ];
    //   const expectedOutputItems: any[] = [
    //     {
    //       isConfigured: true,
    //       isActive: true,
    //       createdAt: new Date('2023-06-01'),
    //       template: {
    //         src: 'ezCater Order',
    //         target: 'Nutshell Lead',
    //       },
    //       event: 'ezCater Order Received',
    //     },
    //   ];
    //   const result = service.mapCompanyIntegrationListForOutput(listItems);
    //   expect(result[0].template).toEqual(expectedOutputItems[0].template);
    // });
    // it('should map event property using the INTEGRATION_EVENT_MAPPER', () => {
    //   const listItems: any[] = [
    //     {
    //       isConfigured: true,
    //       isActive: true,
    //       createdAt: new Date('2023-06-01'),
    //       template: {
    //         srcSystem: $Enums.ExternalSystemName.EZ_CATER,
    //         srcEntity: $Enums.ExternalEntity.Order,
    //         targetSystem: $Enums.ExternalSystemName.NUTSHELL,
    //         targetEntity: $Enums.ExternalEntity.Lead,
    //       },
    //       event: $Enums.IntegrationEvent.ezCaterOrderReceived,
    //     } as any,
    //   ];
    //   const expectedOutputItems: any[] = [
    //     {
    //       isConfigured: true,
    //       isActive: true,
    //       createdAt: new Date('2023-06-01'),
    //       template: {
    //         src: 'EzCater.Order',
    //         target: 'MySystem.Order',
    //       },
    //       event: 'ezCater Order Received',
    //     },
    //   ];
    //   const result = service.mapCompanyIntegrationListForOutput(listItems);
    //   expect(result[0].event).toEqual(expectedOutputItems[0].event);
    //   expect(result[0].event).toEqual(
    //     INTEGRATION_EVENT_MAPPER[listItems[0].event] as any,
    //   );
    // });
  });
});
