import { Injectable } from '@nestjs/common';
import { ISystemIntegrationDbQueryBuilder } from './interfaces/system-integration-db-query-builder.service.interface';

@Injectable()
export class SystemIntegrationDbQueryBuilderService
  implements ISystemIntegrationDbQueryBuilder {}
