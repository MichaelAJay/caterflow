import { Injectable } from '@nestjs/common';
import { ICateringCompanyDbQueryBuilder } from './interfaces/catering-company-db-query-builder.service.interface';
import { Prisma } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import {
  IBuildCreateCateringCompanyArgs,
  IBuildRetrieveIntegrationListArgs,
} from './interfaces/query-builder-args.interfaces';
import { CompanyIntegrationListItem } from 'src/common/types/company-integration-list-item.type';

@Injectable()
export class CateringCompanyDbQueryBuilderService
  implements ICateringCompanyDbQueryBuilder
{
  buildCreateCateringCompanyQuery(
    input: IBuildCreateCateringCompanyArgs,
  ): Prisma.CateringCompanyCreateArgs<DefaultArgs> {
    return {
      data: input,
    };
  }

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
  }
}
