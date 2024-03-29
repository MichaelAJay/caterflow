import { IUserSystemActionDbQueryBuilder } from 'src/internal-modules/external-handlers/db-handlers/user-system-action-db-handler/interfaces/user-system-action-db-query-builder.service.interface';

export const mockUserSystemActionDbQueryBuilder: IUserSystemActionDbQueryBuilder =
  {
    buildCreateUserSystemActionQuery: jest.fn(),
    buildCreateManyUserSystemActionsQuery: jest.fn(),
    buildRetrieveUniqueUserSystemActionQuery: jest.fn(),
    buildRetrieveManyUserSystemActionsQuery: jest.fn(),
  };
