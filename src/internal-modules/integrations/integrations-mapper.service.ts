import { Injectable } from '@nestjs/common';
import { IIntegrationsMapper } from './interfaces/integrations-mapper.service.interface';
import { IntegrationTemplateWithRequirements } from '../external-handlers/db-handlers/catering-company-db-handler/types/return/integration-template-with-requirements.return.type';
import { ResponseIntegrationTemplate } from './types/mapped/response-integration-template.type';
import { RESPONSE_INTEGRATION_TEMPLATE_EVENT_MAPPER } from './constants/mapping/integration-with-requirements.mapping.constant';

@Injectable()
export class IntegrationsMapperService implements IIntegrationsMapper {
  mapIntegrationsWithRequirementsForResponse(
    records: IntegrationTemplateWithRequirements[],
  ): ResponseIntegrationTemplate[] {
    return records.map((record) => ({
      id: record.id,
      srcSystem: record.srcSystem,
      srcEntity: record.srcEntity,
      targetSystem: record.targetSystem,
      targetEntity: record.targetEntity,
      event: RESPONSE_INTEGRATION_TEMPLATE_EVENT_MAPPER[record.event],
      requirements: record.requirements.map((requirement) => ({
        ...requirement,
      })),
    }));
  }
}
