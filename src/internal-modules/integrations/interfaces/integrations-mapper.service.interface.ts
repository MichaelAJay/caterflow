import { IntegrationTemplateWithRequirements } from 'src/internal-modules/external-handlers/db-handlers/catering-company-db-handler/types/return/integration-template-with-requirements.type';
import { ResponseIntegrationTemplate } from '../types/mapped/response-integration-template.type';

export interface IIntegrationsMapper {
  mapIntegrationsWithRequirementsForResponse(
    records: IntegrationTemplateWithRequirements[],
  ): ResponseIntegrationTemplate[];
}
