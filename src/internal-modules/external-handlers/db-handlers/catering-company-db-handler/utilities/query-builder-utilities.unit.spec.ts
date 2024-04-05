import { Prisma } from '@prisma/client';
import {
  IBuildRetrieveCompanyIntegrationListArgs,
  IBuildRetrieveIntegrationListArgs,
} from '../interfaces/query-builder-args.interfaces';
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
      const args: IBuildRetrieveCompanyIntegrationListArgs = {
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
      const args: IBuildRetrieveCompanyIntegrationListArgs = {
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

      const args: IBuildRetrieveCompanyIntegrationListArgs = {
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
      const args: IBuildRetrieveCompanyIntegrationListArgs = {
        templateSrcSystem: 'ezCater',
        templateTargetSystem: 'Nutshell',
      };
      const companyId = 'test-company';
      const result =
        queryBuilderUtilities.buildRetrieveCompanyIntegrationsListWhereClause(
          companyId,
          args,
        );
      expect((result.template as any).AND).toContainEqual({
        srcSystem: 'ezCater',
      });
      expect((result.template as any).AND).toContainEqual({
        targetSystem: 'Nutshell',
      });
    });

    it('should return correct conditions when all options are provided', () => {
      const args: IBuildRetrieveCompanyIntegrationListArgs = {
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
        template: {
          AND: [{ srcSystem: 'ezCater' }, { targetSystem: 'Nutshell' }],
        },
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

  describe('buildRetrieveIntegrationTemplatesListWhereClause', () => {
    it('should return an empty object when no query parameters are provided', () => {
      const query = {};
      const result =
        queryBuilderUtilities.buildRetrieveIntegrationTemplatesListWhereClause(
          query,
        );
      expect(result).toEqual({});
    });

    it('should include the srcSystem in the whereInput when templateSrcSystem is provided', () => {
      const query: IBuildRetrieveIntegrationListArgs = {
        templateSrcSystem: 'ezCater',
      };
      const result =
        queryBuilderUtilities.buildRetrieveIntegrationTemplatesListWhereClause(
          query,
        );
      expect(result).toEqual({ srcSystem: 'ezCater' });
    });

    it('should include the targetSystem in the whereInput when templateTargetSystem is provided', () => {
      const query: IBuildRetrieveIntegrationListArgs = {
        templateTargetSystem: 'ezCater',
      };
      const result =
        queryBuilderUtilities.buildRetrieveIntegrationTemplatesListWhereClause(
          query,
        );
      expect(result).toEqual({ targetSystem: 'ezCater' });
    });

    it('should include both srcSystem and targetSystem in the whereInput when both are provided', () => {
      const query: IBuildRetrieveIntegrationListArgs = {
        templateSrcSystem: 'ezCater',
        templateTargetSystem: 'Nutshell',
      };
      const result =
        queryBuilderUtilities.buildRetrieveIntegrationTemplatesListWhereClause(
          query,
        );
      expect(result).toEqual({
        srcSystem: 'ezCater',
        targetSystem: 'Nutshell',
      });
    });

    it('should ignore additional properties in the query object', () => {
      const query = { templateSrcSystem: 'ezCater', unknownProperty: 'value' };
      const result =
        queryBuilderUtilities.buildRetrieveIntegrationTemplatesListWhereClause(
          query as IBuildRetrieveIntegrationListArgs,
        );
      expect(result).toEqual({ srcSystem: 'ezCater' });
    });

    it('should return the correct Prisma.IntegrationTemplateWhereInput type', () => {
      const query: IBuildRetrieveIntegrationListArgs = {
        templateSrcSystem: 'ezCater',
        templateTargetSystem: 'Nutshell',
      };
      const result =
        queryBuilderUtilities.buildRetrieveIntegrationTemplatesListWhereClause(
          query,
        );
      expect(result).toBeInstanceOf(Object);
      expect(result).toHaveProperty('srcSystem', 'ezCater');
      expect(result).toHaveProperty('targetSystem', 'Nutshell');
    });
  });
});
