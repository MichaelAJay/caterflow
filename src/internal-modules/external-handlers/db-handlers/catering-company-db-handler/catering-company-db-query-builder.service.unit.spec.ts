import { Test, TestingModule } from '@nestjs/testing';
import { CateringCompanyDbQueryBuilderService } from './catering-company-db-query-builder.service';
import { IBuildGetCompanyIntegrationListArgs } from './interfaces/query-builder-args.interfaces';
import queryBuilderUtilities from './utilities/query-builder-utilities';
import { $Enums, Prisma } from '@prisma/client';

jest.mock('./utilities/query-builder-utilities');

describe('CateringCompanyDbQueryBuilderService', () => {
  let service: CateringCompanyDbQueryBuilderService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [CateringCompanyDbQueryBuilderService],
    }).compile();

    service = module.get<CateringCompanyDbQueryBuilderService>(
      CateringCompanyDbQueryBuilderService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('buildCreateCateringCompanyQuery', () => {
    it('should return an object with data set to the input', () => {
      const input = { name: 'Test CateringCompany', ownerId: 'testOwnerId' };
      const expectedOutput = { data: input };

      const result = service.buildCreateCateringCompanyQuery(input);

      expect(result).toEqual(expectedOutput);
    });
  });

  describe('buildRetrieveCompanyIntegrationsListQueryWithoutInclude', () => {
    it('calls query builder where clause utility with the correct arguments', () => {
      const companyId = 'abc123';
      const query: IBuildGetCompanyIntegrationListArgs = {
        isConfigured: true,
      };

      const utilityWhereClauseReturn: Prisma.CompanyIntegrationWhereInput = {
        companyId,
        isConfigured: true,
      };

      const spy = jest
        .spyOn(
          queryBuilderUtilities,
          'buildRetrieveCompanyIntegrationsListWhereClause',
        )
        .mockReturnValue(utilityWhereClauseReturn);

      service.buildRetrieveCompanyIntegrationsListQueryWithoutInclude(
        companyId,
        query,
      );

      expect(spy).toHaveBeenCalledWith(companyId, query);
    });
    it('returns an object with where and default take properties if queryInput is undefined', () => {
      const companyId = 'abc123';
      const utilityWhereClauseReturn: Prisma.CompanyIntegrationWhereInput = {
        companyId,
      };
      jest
        .spyOn(
          queryBuilderUtilities,
          'buildRetrieveCompanyIntegrationsListWhereClause',
        )
        .mockReturnValue(utilityWhereClauseReturn);

      const result =
        service.buildRetrieveCompanyIntegrationsListQueryWithoutInclude(
          companyId,
          undefined,
        );

      expect(result).toHaveProperty('where');
      expect(result).toHaveProperty('take');
    });
    it('returns an object with where and take properties if queryInput is defined', () => {
      const companyId = 'abc123';
      const query: IBuildGetCompanyIntegrationListArgs = {
        isConfigured: true,
      };
      const utilityWhereClauseReturn: Prisma.CompanyIntegrationWhereInput = {
        companyId,
        isConfigured: true,
      };
      jest
        .spyOn(
          queryBuilderUtilities,
          'buildRetrieveCompanyIntegrationsListWhereClause',
        )
        .mockReturnValue(utilityWhereClauseReturn);

      const result =
        service.buildRetrieveCompanyIntegrationsListQueryWithoutInclude(
          companyId,
          query,
        );

      expect(result).toHaveProperty('where');
      expect(result).toHaveProperty('take');
    });
    it('returns an object with default "take" if query is undefined', () => {
      const companyId = 'abc123';
      const query: IBuildGetCompanyIntegrationListArgs | undefined =
        undefined;
      const utilityWhereClauseReturn: Prisma.CompanyIntegrationWhereInput = {
        companyId,
      };
      jest
        .spyOn(
          queryBuilderUtilities,
          'buildRetrieveCompanyIntegrationsListWhereClause',
        )
        .mockReturnValue(utilityWhereClauseReturn);

      const result =
        service.buildRetrieveCompanyIntegrationsListQueryWithoutInclude(
          companyId,
          query,
        );
      expect(result).toHaveProperty('take', 10);
    });
    it('returns an object with default "take" if query.perPage is not included', () => {
      const companyId = 'abc123';
      const query: IBuildGetCompanyIntegrationListArgs = {
        isActive: true,
      };
      const utilityWhereClauseReturn: Prisma.CompanyIntegrationWhereInput = {
        companyId,
        isActive: true,
      };
      jest
        .spyOn(
          queryBuilderUtilities,
          'buildRetrieveCompanyIntegrationsListWhereClause',
        )
        .mockReturnValue(utilityWhereClauseReturn);

      const result =
        service.buildRetrieveCompanyIntegrationsListQueryWithoutInclude(
          companyId,
          query,
        );
      expect(result).toHaveProperty('take', 10);
    });
    it('returns an object without "skip" if query is undefined', () => {
      const companyId = 'abc123';
      const query: IBuildGetCompanyIntegrationListArgs | undefined =
        undefined;
      const utilityWhereClauseReturn: Prisma.CompanyIntegrationWhereInput = {
        companyId,
      };
      jest
        .spyOn(
          queryBuilderUtilities,
          'buildRetrieveCompanyIntegrationsListWhereClause',
        )
        .mockReturnValue(utilityWhereClauseReturn);
      const result =
        service.buildRetrieveCompanyIntegrationsListQueryWithoutInclude(
          companyId,
          query,
        );
      expect(result).not.toHaveProperty('skip');
    });
    it('returns an object without "skip" if query.pg is not included', () => {
      const companyId = 'abc123';
      const query: IBuildGetCompanyIntegrationListArgs = {
        isActive: true,
      };
      const utilityWhereClauseReturn: Prisma.CompanyIntegrationWhereInput = {
        companyId,
        isActive: true,
      };
      jest
        .spyOn(
          queryBuilderUtilities,
          'buildRetrieveCompanyIntegrationsListWhereClause',
        )
        .mockReturnValue(utilityWhereClauseReturn);
      const result =
        service.buildRetrieveCompanyIntegrationsListQueryWithoutInclude(
          companyId,
          query,
        );
      expect(query).not.toHaveProperty('pg');
      expect(result).not.toHaveProperty('skip');
    });
    it('returns an object without "skip" if query.pg is 1', () => {
      const companyId = 'abc123';
      const query: IBuildGetCompanyIntegrationListArgs = { pg: 1 };
      const utilityWhereClauseReturn: Prisma.CompanyIntegrationWhereInput = {
        companyId,
      };
      jest
        .spyOn(
          queryBuilderUtilities,
          'buildRetrieveCompanyIntegrationsListWhereClause',
        )
        .mockReturnValue(utilityWhereClauseReturn);
      const result =
        service.buildRetrieveCompanyIntegrationsListQueryWithoutInclude(
          companyId,
          query,
        );
      expect(query).toHaveProperty('pg', 1);
      expect(result).not.toHaveProperty('skip');
    });
    it('returns an object with "skip" if query.pg is greater than 1', () => {
      const companyId = 'abc123';
      const query: IBuildGetCompanyIntegrationListArgs = { pg: 2 };
      const utilityWhereClauseReturn: Prisma.CompanyIntegrationWhereInput = {
        companyId,
      };
      jest
        .spyOn(
          queryBuilderUtilities,
          'buildRetrieveCompanyIntegrationsListWhereClause',
        )
        .mockReturnValue(utilityWhereClauseReturn);
      const result =
        service.buildRetrieveCompanyIntegrationsListQueryWithoutInclude(
          companyId,
          query,
        );
      expect(query).toHaveProperty('pg');
      expect(query.pg).toBeGreaterThan(1);
      expect(result).toHaveProperty('skip');
    });
    it('returns an object without "orderBy" if query is undefined', () => {
      const companyId = 'abc123';
      const utilityWhereClauseReturn: Prisma.CompanyIntegrationWhereInput = {
        companyId,
      };
      jest
        .spyOn(
          queryBuilderUtilities,
          'buildRetrieveCompanyIntegrationsListWhereClause',
        )
        .mockReturnValue(utilityWhereClauseReturn);
      const result =
        service.buildRetrieveCompanyIntegrationsListQueryWithoutInclude(
          companyId,
          undefined,
        );
      expect(result).not.toHaveProperty('orderBy');
    });
    it('returns an object without "orderBy" if query.sort is undefined', () => {
      const companyId = 'abc123';
      const query: IBuildGetCompanyIntegrationListArgs = { pg: 2 };
      const utilityWhereClauseReturn: Prisma.CompanyIntegrationWhereInput = {
        companyId,
      };
      jest
        .spyOn(
          queryBuilderUtilities,
          'buildRetrieveCompanyIntegrationsListWhereClause',
        )
        .mockReturnValue(utilityWhereClauseReturn);

      const result =
        service.buildRetrieveCompanyIntegrationsListQueryWithoutInclude(
          companyId,
          query,
        );
      expect(result).not.toHaveProperty('orderBy');
    });
    it('returns an object without "orderBy" if query.sort is defined', () => {
      const companyId = 'abc123';
      const query: IBuildGetCompanyIntegrationListArgs = {
        sort: 'created_asc',
      };
      const utilityWhereClauseReturn: Prisma.CompanyIntegrationWhereInput = {
        companyId,
      };
      jest
        .spyOn(
          queryBuilderUtilities,
          'buildRetrieveCompanyIntegrationsListWhereClause',
        )
        .mockReturnValue(utilityWhereClauseReturn);

      const result =
        service.buildRetrieveCompanyIntegrationsListQueryWithoutInclude(
          companyId,
          query,
        );
      expect(result).toHaveProperty('orderBy');
    });
    it('returns an object with "where", "take", "orderBy" and "skip" if query.pg is greater than 1 and query.sort is defined', () => {
      const companyId = 'abc123';
      const query: IBuildGetCompanyIntegrationListArgs = {
        pg: 2,
        sort: 'created_asc',
      };
      const utilityWhereClauseReturn: Prisma.CompanyIntegrationWhereInput = {
        companyId,
      };
      jest
        .spyOn(
          queryBuilderUtilities,
          'buildRetrieveCompanyIntegrationsListWhereClause',
        )
        .mockReturnValue(utilityWhereClauseReturn);
      const result =
        service.buildRetrieveCompanyIntegrationsListQueryWithoutInclude(
          companyId,
          query,
        );

      expect(query).toHaveProperty('pg');
      expect(query.pg).toBeGreaterThan(1);
      expect(query).toHaveProperty('sort');
      expect(['created_asc', 'created_desc']).toContain(query.sort);
      expect(result).toHaveProperty('where');
      expect(result).toHaveProperty('take');
      expect(result).toHaveProperty('orderBy');
      expect(result).toHaveProperty('skip');
    });
  });

  describe('buildCreateCompanyIntegrationAsset', () => {
    it('should return correct data when data and companyIntegrationIds are not provided', () => {
      const result = service.buildCreateCompanyIntegrationAsset(
        'companyId1',
        1,
        $Enums.IntegrationAssetType.API_CREDENTIAL_API_KEY,
        $Enums.ExternalSystem.ezCater,
        true,
        'creatorId1',
      );

      expect(result).toEqual({
        data: {
          companyId: 'companyId1',
          integrationRequirementId: 1,
          type: $Enums.IntegrationAssetType.API_CREDENTIAL_API_KEY,
          system: $Enums.ExternalSystem.ezCater,
          isSecret: true,
          creatorId: 'creatorId1',
          menuId: undefined,
        },
      });
    });

    it('should return correct data when data and companyIntegrationIds are provided', () => {
      const result = service.buildCreateCompanyIntegrationAsset(
        'companyId1',
        1,
        $Enums.IntegrationAssetType.API_CREDENTIAL_API_KEY,
        $Enums.ExternalSystem.ezCater,
        true,
        'creatorId1',
        2,
        { key: 'value' },
        [{ id: 'integrationId1' }],
      );

      expect(result).toEqual({
        data: {
          companyId: 'companyId1',
          integrationRequirementId: 1,
          type: $Enums.IntegrationAssetType.API_CREDENTIAL_API_KEY,
          system: $Enums.ExternalSystem.ezCater,
          isSecret: true,
          creatorId: 'creatorId1',
          menuId: 2,
          data: { key: 'value' },
          integrations: {
            connect: [{ id: 'integrationId1' }],
          },
        },
      });
    });
  });
});
