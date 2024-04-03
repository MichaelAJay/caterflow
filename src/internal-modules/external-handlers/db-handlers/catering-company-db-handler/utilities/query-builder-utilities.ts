import { Prisma } from '@prisma/client';
import { IBuildRetrieveIntegrationListArgs } from '../interfaces/query-builder-args.interfaces';

const queryBuilderUtilities = {
  buildRetrieveCompanyIntegrationsListWhereClause(
    companyId: string,
    query?: IBuildRetrieveIntegrationListArgs,
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
      const templateConditions: Prisma.CompanyIntegrationWhereInput[] = [];

      if (templateSrcSystem) {
        templateConditions.push({ template: { srcSystem: templateSrcSystem } });
      }

      if (templateTargetSystem) {
        templateConditions.push({
          template: { targetSystem: templateTargetSystem },
        });
      }

      if (templateConditions.length > 0) {
        input.AND = templateConditions;
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
