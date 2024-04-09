import { Injectable } from '@nestjs/common';
import { IIntegrationsMapper } from './interfaces/integrations-mapper.service.interface';
import { IntegrationTemplateWithRequirements } from '../external-handlers/db-handlers/catering-company-db-handler/types/return/integration-template-with-requirements.return.type';
import { ResponseIntegrationTemplate } from './types/mapped/response-integration-template.type';
import {
  RESPONSE_INTEGRATION_REQUIREMENT_TYPE_MAPPER,
  RESPONSE_INTEGRATION_TEMPLATE_EVENT_MAPPER,
} from './constants/mapping/integration-with-requirements.mapping.constant';

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
        type: RESPONSE_INTEGRATION_REQUIREMENT_TYPE_MAPPER[requirement.type],
        fields: Array.isArray(requirement.data)
          ? requirement.data.map(
              (
                datum: {
                  name?: string;
                  uiName?: string;
                  isSecret?: boolean;
                } | null,
              ) => {
                // Extra care required for requirement.data - it is unknown json at this point
                const DEFAULT_NAME = 'Unknown';
                const DEFAULT_IS_SECRET = true;

                if (!datum) {
                  return { name: DEFAULT_NAME, isSecret: DEFAULT_IS_SECRET };
                }

                return {
                  name: datum.uiName || DEFAULT_NAME,
                  isSecret:
                    typeof datum.isSecret === 'boolean'
                      ? datum.isSecret
                      : DEFAULT_IS_SECRET,
                };
              },
            )
          : [],
        data: undefined,
      })),
    }));
  }
}
