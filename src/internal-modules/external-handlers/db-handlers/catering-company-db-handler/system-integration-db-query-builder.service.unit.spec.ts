import { Test, TestingModule } from '@nestjs/testing';
import { SystemIntegrationDbQueryBuilderService } from './system-integration-db-query-builder.service';
import queryBuilderUtilities from './utilities/query-builder-utilities';
import { Prisma } from '@prisma/client';
import { IBuildRetrieveIntegrationListArgs } from './interfaces/query-builder-args.interfaces';

jest.mock('./utilities/query-builder-utilities');

describe('SystemIntegrationDbQueryBuilderService', () => {
  let service: SystemIntegrationDbQueryBuilderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SystemIntegrationDbQueryBuilderService],
    }).compile();

    service = module.get<SystemIntegrationDbQueryBuilderService>(
      SystemIntegrationDbQueryBuilderService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('buildRetrieveIntegrationsListQueryWithoutInclude', () => {
    const DEFAULT_QUERY_OBJECT = { take: 10 };

    const utilityWhereClauseReturn: Prisma.IntegrationTemplateWhereInput = {
      srcSystem: 'ezCater',
      targetSystem: 'Nutshell',
    };

    beforeEach(() => {
      jest.clearAllMocks();
      jest
        .spyOn(
          queryBuilderUtilities,
          'buildRetrieveIntegrationTemplatesListWhereClause',
        )
        .mockReturnValue(utilityWhereClauseReturn);
    });

    it('should return the default query object when no queryInput is provided', () => {
      const result = service.buildRetrieveIntegrationsListQueryWithoutInclude();
      expect(result).toEqual(DEFAULT_QUERY_OBJECT);
    });

    it('should use the provided pg and perPage values when queryInput is provided', () => {
      const queryInput = { pg: 2, perPage: 20 };
      const result =
        service.buildRetrieveIntegrationsListQueryWithoutInclude(queryInput);
      expect(result).toEqual({ take: 20, skip: 20 });
    });

    it('should include the where clause when templateSrcSystem or templateTargetSystem is provided', () => {
      const queryInput: IBuildRetrieveIntegrationListArgs = {
        templateSrcSystem: 'ezCater',
        templateTargetSystem: 'Nutshell',
      };
      const result =
        service.buildRetrieveIntegrationsListQueryWithoutInclude(queryInput);
      expect(
        queryBuilderUtilities.buildRetrieveIntegrationTemplatesListWhereClause,
      ).toHaveBeenCalledWith(queryInput);
      expect(result).toEqual({ take: 10, where: utilityWhereClauseReturn });
    });

    it('should calculate the skip value correctly when pg is greater than 1', () => {
      const queryInput = { pg: 3, perPage: 20 };
      const result =
        service.buildRetrieveIntegrationsListQueryWithoutInclude(queryInput);
      expect(result).toEqual({ take: 20, skip: 40 });
    });

    it('should handle edge case when pg is 0', () => {
      const queryInput = { pg: 0, perPage: 20 };
      const result =
        service.buildRetrieveIntegrationsListQueryWithoutInclude(queryInput);
      expect(result).toEqual({ take: 20 });
    });

    it('should handle edge case when perPage is 0', () => {
      const queryInput = { pg: 1, perPage: 0 };
      const result =
        service.buildRetrieveIntegrationsListQueryWithoutInclude(queryInput);
      expect(result).toEqual({ take: 10 });
    });

    it('should return the correct Omit<Prisma.IntegrationTemplateFindManyArgs, "include"> type', () => {
      const queryInput: IBuildRetrieveIntegrationListArgs = {
        pg: 2,
        perPage: 20,
        templateSrcSystem: 'ezCater',
        templateTargetSystem: 'Nutshell',
      };
      const result =
        service.buildRetrieveIntegrationsListQueryWithoutInclude(queryInput);
      expect(result).toBeInstanceOf(Object);
      expect(result).toHaveProperty('take', 20);
      expect(result).toHaveProperty('skip', 20);
      expect(result).toHaveProperty('where', utilityWhereClauseReturn);
    });
  });

  describe('buildRetrieveIntegrationQueryWithoutInclude', () => {
    it('should return the simple find unique args with only the where clause', () => {
      const templateId = 1;
      const result =
        service.buildRetrieveIntegrationQueryWithoutInclude(templateId);
      const expectedResult: Pick<
        Prisma.IntegrationTemplateFindUniqueArgs,
        'where'
      > = { where: { id: templateId } };
      expect(result).toEqual(expectedResult);
    });
  });
});
