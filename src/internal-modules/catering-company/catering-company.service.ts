import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ICateringCompanyService } from './interfaces/catering-company.service.interface';
import { CateringCompanyDbHandlerService } from '../external-handlers/db-handlers/catering-company-db-handler/catering-company-db-handler.service';
import { UserDbHandlerService } from '../external-handlers/db-handlers/user-db-handler/user-db-handler.service';
import { CompanyRoleAndPermissionDbHandlerService } from '../external-handlers/db-handlers/company-role-and-permission-db-handler/company-role-and-permission-db-handler.service';
import { CompanyMapperService } from './company-mapper.service';
import { IBuildGetCompanyIntegrationListArgs } from '../external-handlers/db-handlers/catering-company-db-handler/interfaces/query-builder-args.interfaces';
import { SecretManagerService } from '../external-handlers/secret-manager/secret-manager.service';
import { SystemIntegrationDbHandlerService } from '../external-handlers/db-handlers/catering-company-db-handler/system-integration-db-handler.service';
import { EzCaterHandlerService } from '../external-handlers/ezcater-handler/ezcater-handler.service';
import { $Enums } from '@prisma/client';
import { ERROR_CODE } from 'src/common/codes/error-codes';

@Injectable()
export class CateringCompanyService implements ICateringCompanyService {
  constructor(
    private readonly cateringCompanyDbHandler: CateringCompanyDbHandlerService,
    private readonly systemIntegrationDbHandler: SystemIntegrationDbHandlerService,
    private readonly userDbHandler: UserDbHandlerService,
    private readonly companyRoleDbHandler: CompanyRoleAndPermissionDbHandlerService,
    private readonly companyMapper: CompanyMapperService,
    private readonly secretManager: SecretManagerService,
    private readonly ezCaterHandler: EzCaterHandlerService,
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

  async retrieveConnectionsList(
    companyId: string,
    query?: IBuildGetCompanyIntegrationListArgs,
  ): Promise<any> {}

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
    // When an integration is created, it's quite similar to how an external system connection is created, but in reverse
  }

  async createExternalSystemConnection(companyId: string, systemId: number) {
    const record =
      await this.cateringCompanyDbHandler.createExternalSystemConnection(
        companyId,
        systemId,
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
    // Since the behavior will differ based on whether the requirement is a secret, we must first get the requirement
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

  async importCaterersFromEzCater(companyId: string) {
    // Retrieve company asset
    const asset = await this.cateringCompanyDbHandler.getAsset(
      companyId,
      $Enums.ExternalSystemConnectionRequirementType.API_KEY,
      $Enums.ExternalSystemName.EZ_CATER,
    );

    if (asset == null) {
      throw new NotFoundException('Company asset not found');
    }

    // Confirm ezCater connection is ready to use
    if (!asset.connection.isFullyConfigured) {
      throw new ConflictException(
        ERROR_CODE.IncompleteExternalSystemConnection,
      );
    }

    if (!asset.connection.isTested) {
      // First, try to carry out test. If it doesn't pass, throw an error
    }

    // Retrieve caterer records
    const caterers = await this.ezCaterHandler.getCaterers(companyId, asset.id);
    if (caterers.length === 0) {
      // Ensure user understands that no caterer records were returned
      return 'No caterers to add';
    }

    // This could potentially cause a problem because caterers is iterated over once here, and again in the db handler
    // How many is "a lot" of caterers for a company, and what's the performance impact of that?
    await this.cateringCompanyDbHandler.createCaterers(
      companyId,
      caterers.map((caterer) => ({
        name: caterer.name,
        storeNumber: caterer.storeNumber,
        ezCaterId: caterer.uuid,
      })),
    );
  }
}
