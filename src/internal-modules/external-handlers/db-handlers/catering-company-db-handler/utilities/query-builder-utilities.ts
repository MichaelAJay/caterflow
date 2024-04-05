import { Prisma } from '@prisma/client';
import { IBuildRetrieveCompanyIntegrationListArgs } from '../interfaces/query-builder-args.interfaces';

const queryBuilderUtilities = {
  buildRetrieveCompanyIntegrationsListWhereClause(
    companyId: string,
    query?: IBuildRetrieveCompanyIntegrationListArgs,
  ): Prisma.CompanyIntegrationWhereInput {
    const input: Prisma.CompanyIntegrationWhereInput = {
      companyId,
    };

    if (query) {
      const {
        isConfigured,
        isActive,
        createdSince,
        templateSrcSystem,
        templateTargetSystem,
      } = query;

      if (typeof isConfigured === 'boolean') {
        input.isConfigured = isConfigured;
      }

      if (typeof isActive === 'boolean') {
        input.isActive = isActive;
      }

      if (createdSince) {
        input.createdAt = { gte: createdSince };
      }
      const templateConditions: Prisma.IntegrationTemplateWhereInput[] = [];

      if (templateSrcSystem) {
        templateConditions.push({ srcSystem: templateSrcSystem });
      }

      if (templateTargetSystem) {
        templateConditions.push({ targetSystem: templateTargetSystem });
      }

      if (templateConditions.length > 0) {
        input.template = {
          AND: templateConditions,
        };
      }
    }

    return input;
  },
  buildRetrieveCompanyIntegrationsListSortClause(
    sort: 'created_asc' | 'created_desc',
  ): Prisma.CompanyIntegrationOrderByWithRelationInput {
    const sortOrder = sort.split('_')[1] as 'asc' | 'desc';
    return { createdAt: sortOrder };
  },
};
export default queryBuilderUtilities;
