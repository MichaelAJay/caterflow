import { Injectable } from '@nestjs/common';
import { ICateringCompanyDbHandler } from './interfaces/catering-company-db-handler.service.interface';
import { CateringCompanyDbQueryBuilderService } from './catering-company-db-query-builder.service';
import { PrismaClientService } from '../../../../external-modules/prisma-client/prisma-client.service';
import { CateringCompany } from '@prisma/client';
import { CompanyIntegrationListItem } from '../../../../common/types/company-integration-list-item.type';
import uuidUtils from '../../../../utility/functions/uuid-utils';
import { InvalidUUIDError } from '../../../../common/errors/invalid_uuid.error';
import { ERROR_CODE } from '../../../../common/codes/error-codes';
import { IBuildRetrieveIntegrationListArgs } from './interfaces/query-builder-args.interfaces';

@Injectable()
export class CateringCompanyDbHandlerService
  implements ICateringCompanyDbHandler
{
  constructor(
    private readonly cateringCompanyDbQueryBuilder: CateringCompanyDbQueryBuilderService,
    private readonly prismaClient: PrismaClientService,
  ) {}

  async createCateringCompany(
    name: string,
    ownerId: string,
  ): Promise<CateringCompany> {
    if (!uuidUtils.isUUID(ownerId)) {
      throw new InvalidUUIDError(ERROR_CODE.InvalidUUID);
    }

    // Take care of known errors here
    const company = await this.prismaClient.cateringCompany.create(
      this.cateringCompanyDbQueryBuilder.buildCreateCateringCompanyQuery({
        name,
        ownerId,
      }),
    );
    return company;
  }

  async retrieveCompanyIntegrationsList(
    companyId: string,
    query?: IBuildRetrieveIntegrationListArgs,
  ): Promise<CompanyIntegrationListItem[]> {
    if (!uuidUtils.isUUID(companyId)) {
      throw new InvalidUUIDError(ERROR_CODE.InvalidUUID);
    }

    const records = await this.prismaClient.companyIntegration.findMany({
      where:
        this.cateringCompanyDbQueryBuilder.buildRetrieveCompanyIntegrationsListWhereClause(
          companyId,
          query,
        ),
      include: {
        template: {
          select: {
            srcSystem: true,
            srcEntity: true,
            targetSystem: true,
            targetEntity: true,
          },
        },
      },
    });
    return records;
  }

  async countCompanyIntegrations(companyId: string): Promise<number> {
    if (!uuidUtils.isUUID(companyId)) {
      throw new InvalidUUIDError(ERROR_CODE.InvalidUUID);
    }

    // const ct = await this.prismaClient.companyIntegration.count({
    //   where: { companyId, template: {} },
    // });
    const ct = await this.prismaClient.companyIntegration.count({
      where: { companyId },
    });

    return ct;
  }
}
