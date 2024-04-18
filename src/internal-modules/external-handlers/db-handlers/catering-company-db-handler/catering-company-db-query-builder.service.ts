import { Injectable } from '@nestjs/common';
import { ICateringCompanyDbQueryBuilder } from './interfaces/catering-company-db-query-builder.service.interface';
import { $Enums, Prisma } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import {
  IBuildCreateCateringCompanyArgs,
  IBuildRetrieveCompanyIntegrationListArgs,
} from './interfaces/query-builder-args.interfaces';
import queryBuilderUtilities from './utilities/query-builder-utilities';

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

  buildRetrieveCompanyIntegrationsListQueryWithoutInclude(
    companyId: string,
    queryInput?: IBuildRetrieveCompanyIntegrationListArgs,
  ): Omit<Prisma.CompanyIntegrationFindManyArgs, 'include'> {
    const DEFAULT_PG_NUM = 1;
    const DEFAULT_PER_PAGE = 10;

    const PG_NUM = queryInput && queryInput.pg ? queryInput.pg : DEFAULT_PG_NUM;
    const PER_PAGE =
      queryInput && queryInput.perPage ? queryInput.perPage : DEFAULT_PER_PAGE;

    const query: Omit<Prisma.CompanyIntegrationFindManyArgs, 'include'> = {
      where:
        queryBuilderUtilities.buildRetrieveCompanyIntegrationsListWhereClause(
          companyId,
          queryInput,
        ),
      take: PER_PAGE,
    };

    if (PG_NUM > 1) {
      query.skip = (PG_NUM - 1) * PER_PAGE;
    }

    if (queryInput) {
      const { sort } = queryInput;
      if (sort) {
        query.orderBy =
          queryBuilderUtilities.buildRetrieveCompanyIntegrationsListSortClause(
            sort,
          );
      }
    }

    return query;
  }

  buildCreateCompanyIntegration(
    companyId: string,
    templateId: number,
    event: $Enums.IntegrationEvent,
    creatorId: string,
    connects?: Prisma.CompanyIntegrationAssetWhereUniqueInput[],
    creates?: Prisma.CompanyIntegrationAssetUncheckedCreateWithoutIntegrationsInput[],
  ): Prisma.CompanyIntegrationCreateArgs {
    const data: Prisma.CompanyIntegrationUncheckedCreateInput = {
      companyId,
      templateId,
      event,
      creatorId,
    };

    if (connects || creates) {
      data.assets = {
        connect: connects,
        create: creates,
      };
    }

    return { data };
  }

  buildCreateCompanyIntegrationAsset(
    companyId: string,
    integrationRequirementId: number,
    type: $Enums.IntegrationAssetType,
    system: $Enums.ExternalSystem | null,
    isSecret: boolean,
    creatorId: string,
    menuId?: number,
    data?: Prisma.JsonValue,
    companyIntegrationIds?: { id: string }[],
  ): Prisma.CompanyIntegrationAssetCreateArgs {
    const input: Pick<
      Prisma.CompanyIntegrationAssetUncheckedCreateInput,
      | 'companyId'
      | 'menuId'
      | 'integrationRequirementId'
      | 'type'
      | 'system'
      | 'isSecret'
      | 'creatorId'
      | 'data'
      | 'integrations'
    > = {
      companyId,
      integrationRequirementId,
      type,
      system,
      isSecret,
      creatorId,
      menuId,
    };

    if (data) {
      input.data = data;
    }

    if (companyIntegrationIds) {
      input.integrations = {
        connect: companyIntegrationIds,
      };
    }

    return { data: input };
  }
}
