import { Test, TestingModule } from '@nestjs/testing';
import { CateringCompanyDbQueryBuilderService } from './catering-company-db-query-builder.service';
import { IBuildRetrieveIntegrationListArgs } from './interfaces/query-builder-args.interfaces';

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

  describe('buildCreateCateringCompanyQuery', () => {
    it('should return an object with data set to the input', () => {
      const input = { name: 'Test CateringCompany', ownerId: 'testOwnerId' };
      const expectedOutput = { data: input };

      const result = service.buildCreateCateringCompanyQuery(input);

      expect(result).toEqual(expectedOutput);
    });
  });

  describe('buildRetrieveCompanyIntegrationsListWhereClause', () => {
    it('should return WHERE clause with companyId only when no query is provided', () => {
      const companyId = 'abc123';
      const result =
        service.buildRetrieveCompanyIntegrationsListWhereClause(companyId);

      expect(result).toEqual({ companyId });
    });

    it('should include isConfigured in WHERE clause when provided', () => {
      const companyId = 'abc123';
      const query: IBuildRetrieveIntegrationListArgs = { isConfigured: true };
      const result = service.buildRetrieveCompanyIntegrationsListWhereClause(
        companyId,
        query,
      );

      expect(result).toEqual({ companyId, isConfigured: true });
    });

    it('should include isActive in WHERE clause when provided', () => {
      const companyId = 'abc123';
      const query: IBuildRetrieveIntegrationListArgs = { isActive: false };
      const result = service.buildRetrieveCompanyIntegrationsListWhereClause(
        companyId,
        query,
      );

      expect(result).toEqual({ companyId, isActive: false });
    });

    it('should include createdSince in WHERE clause when provided', () => {
      const companyId = 'abc123';
      const createdSince = new Date('2023-01-01');
      const query: IBuildRetrieveIntegrationListArgs = { createdSince };
      const result = service.buildRetrieveCompanyIntegrationsListWhereClause(
        companyId,
        query,
      );

      expect(result).toEqual({ companyId, createdAt: { gte: createdSince } });
    });

    it('should include template srcSystem condition in WHERE clause when provided', () => {
      const companyId = 'abc123';
      const query: IBuildRetrieveIntegrationListArgs = {
        templateSrcSystem: 'ezCater',
      };
      const result = service.buildRetrieveCompanyIntegrationsListWhereClause(
        companyId,
        query,
      );

      expect(result).toEqual({
        companyId,
        AND: [{ template: { srcSystem: 'ezCater' } }],
      });
    });

    it('should include template targetSystem condition in WHERE clause when provided', () => {
      const companyId = 'abc123';
      const query: IBuildRetrieveIntegrationListArgs = {
        templateTargetSystem: 'Nutshell',
      };
      const result = service.buildRetrieveCompanyIntegrationsListWhereClause(
        companyId,
        query,
      );

      expect(result).toEqual({
        companyId,
        AND: [{ template: { targetSystem: 'Nutshell' } }],
      });
    });

    it('should include both template srcSystem and targetSystem conditions in WHERE clause when provided', () => {
      const companyId = 'abc123';
      const query: IBuildRetrieveIntegrationListArgs = {
        templateSrcSystem: 'ezCater',
        templateTargetSystem: 'Nutshell',
      };
      const result = service.buildRetrieveCompanyIntegrationsListWhereClause(
        companyId,
        query,
      );

      expect(result).toEqual({
        companyId,
        AND: [
          { template: { srcSystem: 'ezCater' } },
          { template: { targetSystem: 'Nutshell' } },
        ],
      });
    });

    it('should include all provided query parameters in WHERE clause', () => {
      const companyId = 'abc123';
      const createdSince = new Date('2023-01-01');
      const query: IBuildRetrieveIntegrationListArgs = {
        isConfigured: true,
        isActive: true,
        createdSince,
        templateSrcSystem: 'ezCater',
        templateTargetSystem: 'Nutshell',
      };
      const result = service.buildRetrieveCompanyIntegrationsListWhereClause(
        companyId,
        query,
      );

      expect(result).toEqual({
        companyId,
        isConfigured: true,
        isActive: true,
        createdAt: { gte: createdSince },
        AND: [
          { template: { srcSystem: 'ezCater' } },
          { template: { targetSystem: 'Nutshell' } },
        ],
      });
    });
  });
});
