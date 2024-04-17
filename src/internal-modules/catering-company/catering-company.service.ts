import { Injectable } from '@nestjs/common';
import { ICateringCompanyService } from './interfaces/catering-company.service.interface';
import { CateringCompanyDbHandlerService } from '../external-handlers/db-handlers/catering-company-db-handler/catering-company-db-handler.service';
import { UserDbHandlerService } from '../external-handlers/db-handlers/user-db-handler/user-db-handler.service';
import { CompanyRoleAndPermissionDbHandlerService } from '../external-handlers/db-handlers/company-role-and-permission-db-handler/company-role-and-permission-db-handler.service';
import { CompanyMapperService } from './company-mapper.service';
import { CompanyIntegrationOutputItem } from 'src/common/types/company-integration-list-item.type';
import { IBuildRetrieveCompanyIntegrationListArgs } from '../external-handlers/db-handlers/catering-company-db-handler/interfaces/query-builder-args.interfaces';
import { CreatedCompanyIntegration } from '../external-handlers/db-handlers/catering-company-db-handler/types/return/create-company-integration.return.type';
import { CreateIntegrationAssetRequestBody } from 'src/api/catering-company/interfaces/request/body/post.create-integration-asset.body.type';
import { SecretManagerService } from '../external-handlers/secret-manager/secret-manager.service';

@Injectable()
export class CateringCompanyService implements ICateringCompanyService {
  constructor(
    private readonly cateringCompanyDbHandler: CateringCompanyDbHandlerService,
    private readonly userDbHandler: UserDbHandlerService,
    private readonly companyRoleDbHandler: CompanyRoleAndPermissionDbHandlerService,
    private readonly companyMapper: CompanyMapperService,
    private readonly secretManager: SecretManagerService,
  ) {}

  async createCateringCompany(name: string, ownerId: string): Promise<any> {
    const company = await this.cateringCompanyDbHandler.createCateringCompany(
      name,
      ownerId,
    );
    await this.companyRoleDbHandler.initializeRolesAndAssignOwner(
      company.id,
      ownerId,
    );
    await this.userDbHandler.updateUser(ownerId, { companyId: company.id });
    return;
  }

  /**
   * *******************
   * ***INTEGRATIONS ***
   * *******************
   */

  async retrieveIntegrationsList(
    companyId: string,
    query?: IBuildRetrieveCompanyIntegrationListArgs,
  ): Promise<CompanyIntegrationOutputItem[]> {
    const records =
      await this.cateringCompanyDbHandler.retrieveCompanyIntegrationsList(
        companyId,
        query,
      );

    const mappedList =
      this.companyMapper.mapCompanyIntegrationListForOutput(records);
    return mappedList;
  }

  async createIntegration(
    companyId: string,
    templateId: number,
    creatorId: string,
  ): Promise<CreatedCompanyIntegration> {
    const results = await this.cateringCompanyDbHandler.createIntegration(
      companyId,
      templateId,
      creatorId,
    );
    return results;
  }

  async createIntegrationAsset(
    companyId: string,
    requirementId: number,
    creatorId: string,
    asset: CreateIntegrationAssetRequestBody,
  ): Promise<any> {
    // Create the record & associate it to the company
    // Then, if asset.isSecret is true, create the secret
    const createdAsset =
      await this.cateringCompanyDbHandler.createIntegrationAsset(
        companyId,
        requirementId,
        creatorId,
        asset.isSecret,
        asset.menuId,
      );

    if (asset.isSecret) {
      const secretName = this.secretManager.getSecretName(
        companyId,
        createdAsset.id,
      );
      await this.secretManager.upsertSecret(
        secretName,
        Buffer.from(asset.value),
      );
    }

    for (const integration of createdAsset.integrations) {
      console.log(integration.id);
    }

    /**
     * Each integration of createdAsset.integrations was just joiend to the created asset
     * As a result of this join, it may be the case that a companyIntegration's requirements are all now fully met.
     * That would be like this:
     * integration: {
     *  template: {
     *    requirements: {}[]
     *  }
     * }
     */

    /**
     * So I need assets associated with each integration. Each asset references its requirement.
     * *** EACH ASSET REFERENCES ITS REQUIREMENT, AND EACH INTEGRATION REFERENCES ITS TEMPLATE ***
     * *** EACH TEMPLATE MAY RETRIEVE ITS REQUIREMENTS
     *
     * Each integration references its templates, and may be JOINED on asset.integrationId = integration.Id
     * Each integration's referenced template may JOIN its requirements on template.id === requirement.templateId
     * Each integration references template's requirements may be associated (loosely, with JS) to each integration's assets by asset.requirementId = requirement.id
     *
     */
  }
}
