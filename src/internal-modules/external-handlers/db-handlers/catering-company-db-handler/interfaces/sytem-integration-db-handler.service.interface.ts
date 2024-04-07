import { IntegrationTemplateWithRequirements } from '../types/return/integration-template-with-requirements.return.type';
import { IBuildRetrieveIntegrationListArgs } from './query-builder-args.interfaces';

export interface ISystemIntegrationDbHandler {
  retrieveList(
    query?: IBuildRetrieveIntegrationListArgs,
  ): Promise<IntegrationTemplateWithRequirements[]>;
}
