import { Injectable } from '@nestjs/common';
import { IAccountDbQueryBuilder } from './interfaces/account-db-query-builder.service.interface';

@Injectable()
export class AccountDbQueryBuilderService implements IAccountDbQueryBuilder {}
