import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CompanyExternalSystemService } from '../company-external-system/company-external-system.service';
import { IBuildGetCompanyIntegrationListArgs } from 'src/internal-modules/external-handlers/db-handlers/catering-company-db-handler/interfaces/query-builder-args.interfaces';
import { CateringCompanyDbHandlerService } from 'src/internal-modules/external-handlers/db-handlers/catering-company-db-handler/catering-company-db-handler.service';
import { SecretManagerService } from 'src/internal-modules/external-handlers/secret-manager/secret-manager.service';
import { SystemIntegrationDbHandlerService } from 'src/internal-modules/external-handlers/db-handlers/catering-company-db-handler/system-integration-db-handler.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CompanyIntegrationAndConnectionService {
  constructor(
    private readonly companyExternalSystemService: CompanyExternalSystemService,
    private readonly cateringCompanyDbHandler: CateringCompanyDbHandlerService,
    private readonly systemIntegrationDbHandler: SystemIntegrationDbHandlerService,
    private readonly secretManager: SecretManagerService,
  ) {}

  // methods
  async retrieveIntegrationsList(
    companyId: string,
    query?: IBuildGetCompanyIntegrationListArgs,
  ) {}

  async retrieveConnectionsList(
    companyId: string,
    query?: IBuildGetCompanyIntegrationListArgs,
  ) {}

  async createIntegration(
    companyId: string,
    templateId: number,
    creatorId: string,
  ) {}

  async updateIntegration(
    integrationId: string,
    updates: Pick<
      Prisma.CompanyIntegrationUncheckedUpdateManyInput,
      'srcConnectionId' | 'targetConnectionId' | 'isConfigured' | 'isActive'
    >,
  ) {
    const res = await this.cateringCompanyDbHandler.updateIntegrations(
      [integrationId],
      updates,
    );
    return res;
  }

  async createExternalSystemConnection(companyId: string, systemId: number) {
    const record =
      await this.cateringCompanyDbHandler.createExternalSystemConnection(
        companyId,
        systemId,
      );

    // If referenced system has 0 requirements, the connection will be fully configured
    if (record.isFullyConfigured) {
      // Test it
    }

    return record;
  }

  async updateExternalSystemConnection(
    connectionId: string,
    updates: Pick<
      Prisma.CompanyExternalSystemConnectionUncheckedUpdateInput,
      'isFullyConfigured' | 'isTested'
    >,
  ) {
    await this.cateringCompanyDbHandler.updateExternalySystemConnection(
      connectionId,
      updates,
    );
  }

  /**
   * Due to the refactor June 13, 2024, there's no service-level creation of connection assets
   * Connection assets are in a JSON attribute directly on the connection
   */
  // async createExternalSystemConnectionAsset(
  //   companyId: string,
  //   connectionId: string,
  //   requirementId: number,
  //   value: any,
  // ) {
  //   // Since the behavior will differ based on whether the requirement is a secret, we must first get the requirement
  //   const { uiName, uiDescription, isSecret } =
  //     await this.systemIntegrationDbHandler.getExternalSystemRequirement(
  //       requirementId,
  //     );

  //   // return;

  //   // Create record
  //   const asset =
  //     await this.cateringCompanyDbHandler.createExternalSystemConnectionAsset(
  //       companyId,
  //       connectionId,
  //       requirementId,
  //       uiName,
  //       uiDescription,
  //       isSecret,
  //       isSecret ? undefined : value,
  //     );

  //   // If secret, store secret
  //   if (isSecret) {
  //     // const { secret } =

  //     const secretName = this.secretManager.getSecretName(companyId, asset.id);
  //     console.log('*** SECRET NAME *** ', secretName);

  //     try {
  //       const secretBuffer = Buffer.from(value);
  //       await this.secretManager.upsertSecret(secretName, secretBuffer);
  //       // Do something special if this fails. Maybe it should be handled in upsertSecret.
  //     } catch (err) {
  //       // Should delete created asset
  //       // Should log
  //       throw new InternalServerErrorException(
  //         'The secret could not be stored. The asset has been deleted. Please try again, and if it does not work, contact support.',
  //       );
  //     }
  //   }

  //   // Determine if asset means that the matching connection is fully configured
  //   // This should be a method in another class
  //   const { connection } = asset;
  //   const { externalSystem } = connection;

  //   // connectionRequirements is the system specification
  //   const { connectionRequirements } = externalSystem;
  //   const requirementMap = connectionRequirements.map((requirement) => {
  //     return {
  //       uiName: requirement.uiName,
  //       uiDescription: requirement.uiDescription,
  //       isSecret: requirement.isSecret,
  //       // If the requirement is associate with a company connection asset, then the requirement is met
  //       isRequirementMet: requirement.companyConnectionAssets.length > 0,
  //     };
  //   });

  //   // are all requirements met?
  //   if (requirementMap.every((requirement) => requirement.isRequirementMet)) {
  //     const testResult = await this.companyExternalSystemService.testConnection(
  //       companyId,
  //       externalSystem,
  //     );
  //     // If specific test passes, update connection record with isFullyConfigured true and isTested true
  //     if (testResult) {
  //       // Carry out connection initializations

  //       await this.updateExternalSystemConnection(connectionId, {
  //         isFullyConfigured: true,
  //         isTested: true,
  //       });

  //       // Now, if the external system connection was updated, it's possible that any integrations associated with this connection are also ready to use
  //       // We need all external services for which the connection is the source or the target
  //       // We need to check all of those external services and we need to return any which are eligible for activating
  //     }
  //     // This should cascade all the way up to company integrations
  //   }
  // }
}
