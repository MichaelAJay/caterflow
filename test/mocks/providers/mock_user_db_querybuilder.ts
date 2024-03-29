import { IUserDbQueryBuilder } from 'src/internal-modules/external-handlers/db-handlers/user-db-handler/interfaces/user-db-query-builder.service.interface';

export const mockUserDbQueryBuilderService: IUserDbQueryBuilder = {
  buildCreateUserQuery: jest.fn(),
  buildRetrieveUniqueUserQuery: jest.fn(),
  buildUpdateUser: jest.fn(),
};
