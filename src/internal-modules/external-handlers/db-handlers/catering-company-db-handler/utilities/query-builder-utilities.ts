import { Prisma } from '@prisma/client';
import {
  IBuildRetrieveCompanyIntegrationListArgs,
  IBuildRetrieveIntegrationListArgs,
} from '../interfaces/query-builder-args.interfaces';

const queryBuilderUtilities = {
  buildRetrieveCompanyIntegrationsListWhereClause(
    companyId: string,
    query?: IBuildRetrieveCompanyIntegrationListArgs,
  ): Prisma.CompanyIntegrationWhereInput {
    const whereInput: Prisma.CompanyIntegrationWhereInput = {
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
        whereInput.isConfigured = isConfigured;
      }

      if (typeof isActive === 'boolean') {
        whereInput.isActive = isActive;
      }

      if (createdSince) {
        whereInput.createdAt = { gte: createdSince };
      }
      const templateConditions: Prisma.IntegrationTemplateWhereInput[] = [];

      if (templateSrcSystem) {
        templateConditions.push({ srcSystem: templateSrcSystem });
      }

      if (templateTargetSystem) {
        templateConditions.push({ targetSystem: templateTargetSystem });
      }

      if (templateConditions.length > 0) {
        whereInput.template = {
          AND: templateConditions,
        };
      }
    }

    return whereInput;
  },
  buildRetrieveCompanyIntegrationsListSortClause(
    sort: 'created_asc' | 'created_desc',
  ): Prisma.CompanyIntegrationOrderByWithRelationInput {
    const sortOrder = sort.split('_')[1] as 'asc' | 'desc';
    return { createdAt: sortOrder };
  },
  buildRetrieveIntegrationTemplatesListWhereClause(
    query: IBuildRetrieveIntegrationListArgs,
  ): Prisma.IntegrationTemplateWhereInput {
    const { templateSrcSystem, templateTargetSystem } = query;

    const whereInput: Prisma.IntegrationTemplateWhereInput = {};

    if (templateSrcSystem) {
      whereInput.srcSystem = templateSrcSystem;
    }

    if (templateTargetSystem) {
      whereInput.targetSystem = templateTargetSystem;
    }

    return whereInput;
  },
};
export default queryBuilderUtilities;
