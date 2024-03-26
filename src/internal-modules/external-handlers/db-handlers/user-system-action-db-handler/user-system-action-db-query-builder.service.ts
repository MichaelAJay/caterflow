import { Injectable } from '@nestjs/common';
import { IUserSystemActionDbQueryBuilder } from './interfaces/user-system-action-db-query-builder.service.interface';

@Injectable()
export class UserSystemActionDbQueryBuilderService
  implements IUserSystemActionDbQueryBuilder {}
