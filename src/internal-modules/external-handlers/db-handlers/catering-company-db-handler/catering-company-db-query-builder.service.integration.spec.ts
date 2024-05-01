import { Test, TestingModule } from '@nestjs/testing';
import { CateringCompanyDbQueryBuilderService } from './catering-company-db-query-builder.service';
import { IBuildGetCompanyIntegrationListArgs } from './interfaces/query-builder-args.interfaces';
import queryBuilderUtilities from './utilities/query-builder-utilities';

describe('CateringCompanyDbQueryBuilderService', () => {
  let service: CateringCompanyDbQueryBuilderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CateringCompanyDbQueryBuilderService],
    }).compile();

    service = module.get<CateringCompanyDbQueryBuilderService>(
      CateringCompanyDbQueryBuilderService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('buildRetrievecompanyIntegrationsListQueryWithoutInclude', () => {
    const DEFAULT_PER_PAGE = 10;

    it('should return WHERE clause with companyId only when no query is provided', () => {
      const companyId = 'abc123';
      const query = undefined;
      const result =
        service.buildRetrieveCompanyIntegrationsListQueryWithoutInclude(
          companyId,
          query,
        );

      expect(query).toBeUndefined();
      expect(result).toEqual({ where: { companyId }, take: DEFAULT_PER_PAGE });
    });

    it('should include isConfigured in WHERE clause when provided', () => {
      const companyId = 'abc123';
      const query: IBuildGetCompanyIntegrationListArgs = {
        isConfigured: true,
      };
      const result =
        service.buildRetrieveCompanyIntegrationsListQueryWithoutInclude(
          companyId,
          query,
        );

      expect(result).toEqual({
        where: { companyId, isConfigured: true },
        take: DEFAULT_PER_PAGE,
      });
    });

    it('should include isActive in WHERE clause when provided', () => {
      const companyId = 'abc123';
      const query: IBuildGetCompanyIntegrationListArgs = {
        isActive: false,
      };
      const result =
        service.buildRetrieveCompanyIntegrationsListQueryWithoutInclude(
          companyId,
          query,
        );

      expect(result).toEqual({
        where: { companyId, isActive: false },
        take: DEFAULT_PER_PAGE,
      });
    });

    it('should include createdSince in WHERE clause when provided', () => {
      const companyId = 'abc123';
      const createdSince = new Date('2023-01-01');
      const query: IBuildGetCompanyIntegrationListArgs = { createdSince };
      const result =
        service.buildRetrieveCompanyIntegrationsListQueryWithoutInclude(
          companyId,
          query,
        );

      expect(result).toEqual({
        where: { companyId, createdAt: { gte: createdSince } },
        take: DEFAULT_PER_PAGE,
      });
    });

    it('should include template srcSystem condition in WHERE clause when provided', () => {
      const companyId = 'abc123';
      const query: IBuildGetCompanyIntegrationListArgs = {
        templateSrcSystem: 'ezCater',
      };
      const result =
        queryBuilderUtilities.buildRetrieveCompanyIntegrationsListWhereClause(
          companyId,
          query,
        );

      expect(result).toEqual({
        companyId,
        template: { AND: [{ srcSystem: 'ezCater' }] },
      });
    });

    it('should include template targetSystem condition in WHERE clause when provided', () => {
      const companyId = 'abc123';
      const query: IBuildGetCompanyIntegrationListArgs = {
        templateTargetSystem: 'Nutshell',
      };
      const result =
        queryBuilderUtilities.buildRetrieveCompanyIntegrationsListWhereClause(
          companyId,
          query,
        );

      expect(result).toEqual({
        companyId,
        template: { AND: [{ targetSystem: 'Nutshell' }] },
      });
    });

    it('should include both template srcSystem and targetSystem conditions in WHERE clause when provided', () => {
      const companyId = 'abc123';
      const query: IBuildGetCompanyIntegrationListArgs = {
        templateSrcSystem: 'ezCater',
        templateTargetSystem: 'Nutshell',
      };
      const result =
        queryBuilderUtilities.buildRetrieveCompanyIntegrationsListWhereClause(
          companyId,
          query,
        );

      expect(result).toEqual({
        companyId,
        template: {
          AND: [{ srcSystem: 'ezCater' }, { targetSystem: 'Nutshell' }],
        },
      });
    });

    it('should include all provided query parameters in WHERE clause', () => {
      const companyId = 'abc123';
      const createdSince = new Date('2023-01-01');
      const query: IBuildGetCompanyIntegrationListArgs = {
        isConfigured: true,
        isActive: true,
        createdSince,
        templateSrcSystem: 'ezCater',
        templateTargetSystem: 'Nutshell',
      };
      const result =
        queryBuilderUtilities.buildRetrieveCompanyIntegrationsListWhereClause(
          companyId,
          query,
        );

      expect(result).toEqual({
        companyId,
        isConfigured: true,
        isActive: true,
        createdAt: { gte: createdSince },
        template: {
          AND: [{ srcSystem: 'ezCater' }, { targetSystem: 'Nutshell' }],
        },
      });
    });

    it('should include valid ORDERBY clause if query.sort is defined', () => {
      const companyId = 'abc123';

      const query: IBuildGetCompanyIntegrationListArgs = {
        sort: 'created_asc',
      };
      const result =
        service.buildRetrieveCompanyIntegrationsListQueryWithoutInclude(
          companyId,
          query,
        );

      expect(result).toEqual({
        where: { companyId },
        take: DEFAULT_PER_PAGE,
        orderBy: { createdAt: 'asc' },
      });
    });
  });
});
