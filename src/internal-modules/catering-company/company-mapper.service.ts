import { Injectable } from '@nestjs/common';
import { $Enums } from '@prisma/client';
import {
  CompanyIntegrationListItem,
  CompanyIntegrationOutputItem,
} from '../../common/types/company-integration-list-item.type';
import { ICompanyMapper } from './interfaces/company-mapper.service.interface';

export type IntegrationEventOutput = 'ezCater Order Received';

export const INTEGRATION_EVENT_MAPPER: Record<
  $Enums.IntegrationEvent,
  IntegrationEventOutput
> = {
  ezCaterOrderReceived: 'ezCater Order Received',
};

@Injectable()
export class CompanyMapperService implements ICompanyMapper {
  mapCompanyIntegrationListForOutput(
    list: CompanyIntegrationListItem[],
  ): CompanyIntegrationOutputItem[] {
    return list.map(
      ({ isConfigured, isActive, createdAt, template, event }) => ({
        isConfigured,
        isActive,
        createdAt,
        template: {
          src: `${template.srcSystem} ${template.srcEntity}`,
          target: `${template.targetSystem} ${template.targetEntity}`,
        },
        event: INTEGRATION_EVENT_MAPPER[event],
      }),
    );
  }
}
