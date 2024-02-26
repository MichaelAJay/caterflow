import { IAccountDbQueryBuilder } from 'src/internal-modules/external-handlers/db-handlers/account-db-handler/interfaces/account-db-query-builder.service.interface';

export const mockAccountDbQueryBuilderService: IAccountDbQueryBuilder = {
  buildCreateAccountQuery: jest.fn(),
};
