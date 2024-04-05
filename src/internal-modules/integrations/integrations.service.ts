import { Injectable } from '@nestjs/common';
import { IBuildRetrieveIntegrationListArgs } from '../external-handlers/db-handlers/catering-company-db-handler/interfaces/query-builder-args.interfaces';

@Injectable()
export class IntegrationsService {
  async getSystemIntegrations(
    query?: IBuildRetrieveIntegrationListArgs,
  ): Promise<any> {
    console.log(query);
    return 'b00ty butt';
  }
}
