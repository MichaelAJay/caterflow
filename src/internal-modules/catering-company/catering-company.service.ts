import { Injectable } from '@nestjs/common';
import { ICateringCompanyService } from './interfaces/catering-company.service.interface';
import { CateringCompanyDbHandlerService } from '../external-handlers/db-handlers/catering-company-db-handler/catering-company-db-handler.service';
import { UserDbHandlerService } from '../external-handlers/db-handlers/user-db-handler/user-db-handler.service';
import { CompanyRoleAndPermissionDbHandlerService } from '../external-handlers/db-handlers/company-role-and-permission-db-handler/company-role-and-permission-db-handler.service';
import { CompanyMapperService } from './company-mapper.service';
import { IBuildGetCompanyIntegrationListArgs } from '../external-handlers/db-handlers/catering-company-db-handler/interfaces/query-builder-args.interfaces';
import { SecretManagerService } from '../external-handlers/secret-manager/secret-manager.service';
import { SystemIntegrationDbHandlerService } from '../external-handlers/db-handlers/catering-company-db-handler/system-integration-db-handler.service';

@Injectable()
export class CateringCompanyService implements ICateringCompanyService {
  constructor(
    private readonly cateringCompanyDbHandler: CateringCompanyDbHandlerService,
    private readonly systemIntegrationDbHandler: SystemIntegrationDbHandlerService,
    private readonly userDbHandler: UserDbHandlerService,
    private readonly companyRoleDbHandler: CompanyRoleAndPermissionDbHandlerService,
    private readonly companyMapper: CompanyMapperService,
    private readonly secretManager: SecretManagerService,
  ) {}

  /**
   * Refactor 20 Apr 24
   */
  async createCateringCompany(name: string, ownerId: string): Promise<any> {
    const company = await this.cateringCompanyDbHandler.createCateringCompany(
      name,
      ownerId,
    );
    await this.companyRoleDbHandler.initializeRolesAndAssignOwner(
      company.id,
      ownerId,
    );
    return;
  }

  /**
   * ****************
   * *** CATERERS ***
   * ****************
   */
  async createCaterer() {}

  /**
   * ********************
   * *** INTEGRATIONS ***
   * ********************
   */

  async retrieveEzCaterWebhookUrl(companyId: string) {
    const baseUrl = 'http://localhost:8080'; // @TODO fix
    return { url: `${baseUrl}/ezcater-webhook-receiver/${companyId}` };
  }

  async retrieveIntegrationsList(
    companyId: string,
    query?: IBuildGetCompanyIntegrationListArgs,
  ): Promise<any> {
    // const records =
    //   await this.cateringCompanyDbHandler.retrieveCompanyIntegrationsList(
    //     companyId,
    //     query,
    //   );
    // const mappedList =
    //   this.companyMapper.mapCompanyIntegrationListForOutput(records);
    // return mappedList;
    // return records;
  }

  async createIntegration(
    companyId: string,
    templateId: number,
    creatorId: string,
  ): Promise<any> {
    // const results = await this.cateringCompanyDbHandler.createIntegration(
    //   companyId,
    //   templateId,
    //   creatorId,
    // );
    // return results;
  }

  async createExternalSystemConnection(
    companyId: string,
    systemId: number,
    userId: string,
  ) {
    // It may be better to actually get the integration templates first, so I know what potential integrationr ecorsd to connect the connection to

    const record =
      await this.cateringCompanyDbHandler.createExternalSystemConnection(
        companyId,
        systemId,
        userId,
        [],
        [],
      );

    // When the external system connection record is created, then it should be connected to all company integrations that require it.
    // To retrieve all company integrations that require it...
    const { externalSystem } = record;
    const { srcFor, targetFor } = externalSystem;

    const srcForIntegrationIds = srcFor.flatMap((e) =>
      e.integrations.map(({ id }) => id),
    );
    const targetForIntegrationIds = targetFor.flatMap((e) =>
      e.integrations.map(({ id }) => id),
    );

    // Update all CompanyIntegration - either the srcConnectionId or the targetConnectionId
    await this.cateringCompanyDbHandler.updateIntegrations(
      srcForIntegrationIds,
      {
        srcConnectionId: record.id,
      },
    );
    await this.cateringCompanyDbHandler.updateIntegrations(
      targetForIntegrationIds,
      { targetConnectionId: record.id },
    );

    return record;
  }

  async createExternalSystemConnectionAsset(
    companyId: string,
    connectionId: string,
    requirementId: number,
    value: any,
    userId: string,
  ) {
    // since the behavior will differ based on whether the requirement is a secret, we must first get the requirement
    const { uiName, uiDescription, isSecret } =
      await this.systemIntegrationDbHandler.getExternalSystemRequirement(
        requirementId,
      );

    // Create record
    const asset =
      await this.cateringCompanyDbHandler.createExternalSystemConnectionAsset(
        companyId,
        connectionId,
        requirementId,
        uiName,
        uiDescription,
        isSecret ? undefined : value,
      );

    // If secret, store secret
    if (isSecret) {
      const secretName = this.secretManager.getSecretName(companyId, asset.id);
      await this.secretManager.upsertSecret(secretName, Buffer.from(value));
    }

    // Determine if asset means that the matching connection is fully configured
    // This should be a method in another class
    const { connection } = asset;
    const { externalSystem } = connection;
    const { connectionRequirements } = externalSystem;
    const requirementMap = connectionRequirements.map((requirement) => {
      return {
        uiName: requirement.uiName,
        uiDescription: requirement.uiDescription,
        isSecret: requirement.isSecret,
        isRequirementMet: requirement.companyConnectionAssets.length > 0,
      };
    });

    // are all requirements met?
    if (requirementMap.every((requirement) => requirement.isRequirementMet)) {
      // Prepare to update connection record with 'isFullyConfigured' true
      // Perform specific test
      // If specific test passes, update connection record with isFullyConfigured true and isTested true
      // This should cascade all the way up to company integrations
    }

    return;
  }
}
