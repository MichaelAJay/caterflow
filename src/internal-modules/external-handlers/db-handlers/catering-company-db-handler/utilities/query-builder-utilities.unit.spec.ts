import { Prisma } from '@prisma/client';
import { IBuildRetrieveIntegrationListArgs } from '../interfaces/query-builder-args.interfaces';
import queryBuilderUtilities from './query-builder-utilities';

describe('queryBuilderUtilities', () => {
  describe('buildRetrieveCompanyIntegrationsListWhereClause', () => {
    it('should return basic where clause with companyId only', () => {
      const companyId = 'test-company';
      const result =
        queryBuilderUtilities.buildRetrieveCompanyIntegrationsListWhereClause(
          companyId,
          undefined,
        );
      expect(result).toEqual({ companyId });
    });

    it('should handle boolean flags correctly', () => {
      const args: IBuildRetrieveIntegrationListArgs = {
        isConfigured: true,
        isActive: false,
      };
      const companyId = 'test-company';
      const result =
        queryBuilderUtilities.buildRetrieveCompanyIntegrationsListWhereClause(
          companyId,
          args,
        );
      expect(result).toMatchObject({
        companyId,
        isConfigured: true,
        isActive: false,
      });
    });

    it('should handle undefined boolean fields correctly', () => {
      const args: IBuildRetrieveIntegrationListArgs = {
        isConfigured: undefined,
        isActive: undefined,
      };
      const companyId = 'test-company';
      const result =
        queryBuilderUtilities.buildRetrieveCompanyIntegrationsListWhereClause(
          companyId,
          args,
        );
      expect(result).toMatchObject({
        companyId,
      });
    });

    it('should handle createdSince correctly', () => {
      const targetDate = new Date('2020-01-01');

      const args: IBuildRetrieveIntegrationListArgs = {
        createdSince: targetDate,
      };
      const companyId = 'test-company';
      const result =
        queryBuilderUtilities.buildRetrieveCompanyIntegrationsListWhereClause(
          companyId,
          args,
        );
      expect((result.createdAt as Prisma.DateTimeFilter).gte).toEqual(
        targetDate,
      );
    });

    it('should handle templateSrcSystem and templateTargetSystem correctly', () => {
      const args: IBuildRetrieveIntegrationListArgs = {
        templateSrcSystem: 'ezCater',
        templateTargetSystem: 'Nutshell',
      };
      const companyId = 'test-company';
      const result =
        queryBuilderUtilities.buildRetrieveCompanyIntegrationsListWhereClause(
          companyId,
          args,
        );
      expect(result.AND).toContainEqual({ template: { srcSystem: 'SystemA' } });
      expect(result.AND).toContainEqual({
        template: { targetSystem: 'SystemB' },
      });
    });

    it('should return correct conditions when all options are provided', () => {
      const args: IBuildRetrieveIntegrationListArgs = {
        isConfigured: true,
        isActive: true,
        createdSince: new Date('2020-01-01'),
        templateSrcSystem: 'ezCater',
        templateTargetSystem: 'Nutshell',
      };
      const companyId = 'test-company';
      const result =
        queryBuilderUtilities.buildRetrieveCompanyIntegrationsListWhereClause(
          companyId,
          args,
        );
      expect(result).toMatchObject({
        companyId,
        isConfigured: true,
        isActive: true,
        createdAt: { gte: new Date('2020-01-01') },
        AND: [
          { template: { srcSystem: 'SystemA' } },
          { template: { targetSystem: 'SystemB' } },
        ],
      });
    });
  });

  describe('buildRetrieveCompanyIntegrationsListSortClause', () => {
    it('should return sort clause for created_asc correctly', () => {
      const sort = 'created_asc';
      const result =
        queryBuilderUtilities.buildRetrieveCompanyIntegrationsListSortClause(
          sort,
        );
      expect(result).toEqual({ createdAt: 'asc' });
    });

    it('should return sort clause for created_desc correctly', () => {
      const sort = 'created_desc';
      const result =
        queryBuilderUtilities.buildRetrieveCompanyIntegrationsListSortClause(
          sort,
        );
      expect(result).toEqual({ createdAt: 'desc' });
    });

    // Here, you can add more tests if your application has more valid sort options.
  });
});
