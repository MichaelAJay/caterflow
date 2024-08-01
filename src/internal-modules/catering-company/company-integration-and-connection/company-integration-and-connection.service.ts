import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CompanyExternalSystemService } from '../company-external-system/company-external-system.service';
import { IBuildGetCompanyIntegrationListArgs } from 'src/internal-modules/external-handlers/db-handlers/catering-company-db-handler/interfaces/query-builder-args.interfaces';
import { CateringCompanyDbHandlerService } from 'src/internal-modules/external-handlers/db-handlers/catering-company-db-handler/catering-company-db-handler.service';
import { SecretManagerService } from 'src/internal-modules/external-handlers/secret-manager/secret-manager.service';
import { SystemIntegrationDbHandlerService } from 'src/internal-modules/external-handlers/db-handlers/catering-company-db-handler/system-integration-db-handler.service';
import { CompanyIntegration, Prisma } from '@prisma/client';
import { RequirementType } from 'src/internal-modules/external-handlers/db-handlers/catering-company-db-handler/types/external_systems_requirements';
import {
  assetStatuses,
  CompanyConnectionWithTypedAssets,
} from 'src/internal-modules/external-handlers/db-handlers/catering-company-db-handler/types/company_connection_assets';
import companyIntegrationAndConnectionUtilities from '../utility/company-integration-and-connection.utilities';
import { validateExternalSystem } from 'src/internal-modules/external-handlers/db-handlers/catering-company-db-handler/validators/external-systems.validator';

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
  ) {
    const integrationTemplate =
      await this.systemIntegrationDbHandler.getIntegrationTemplate(templateId);

    // Check and see if company has any of the connections already established
    const existingConnections =
      await this.cateringCompanyDbHandler.getConnectionsByExternalSystemId(
        companyId,
        [integrationTemplate.srcSystemId, integrationTemplate.targetSystemId],
      );

    const srcConnection = existingConnections.find(
      (connection) => connection.systemId === integrationTemplate.srcSystemId,
    );
    const targetConnection = existingConnections.find(
      (connection) =>
        connection.systemId === integrationTemplate.targetSystemId,
    );

    // If connection found, prepare to connect it directly to the integration
    let srcConnectionId: string | undefined = undefined;
    let isSrcConnectionTested = false;
    if (srcConnection) {
      srcConnectionId = srcConnection.id;
      isSrcConnectionTested = srcConnection.isTested;
    } else {
      // Validate requirements
      if (!validateExternalSystem(integrationTemplate.srcSystem)) {
        throw new InternalServerErrorException('Stuff is messed up');
      }

      const assets =
        companyIntegrationAndConnectionUtilities.mapExternalSystemRequirementsToCompanyAssets(
          integrationTemplate.srcSystem.requirements,
        );

      try {
        let createdSrcConnection =
          await this.cateringCompanyDbHandler.createExternalSystemConnection(
            companyId,
            integrationTemplate.srcSystemId,
            integrationTemplate.srcSystem.uiName,
            assets,
          );

        srcConnectionId = createdSrcConnection.id;
        if (
          createdSrcConnection.isFullyConfigured ||
          companyIntegrationAndConnectionUtilities.isFullOutboundConfigured(
            createdSrcConnection.assets,
          )
        ) {
          createdSrcConnection = await this.testConnectionAndUpdateOnPass(
            companyId,
            createdSrcConnection,
          );
        }
        isSrcConnectionTested = createdSrcConnection.isTested;
      } catch (err) {
        // Should not have errored here - log at least
      }
    }

    let targetConnectionId: string | undefined = undefined;
    let isTargetConnectionTested = false;
    if (targetConnection) {
      targetConnectionId = targetConnection.id;
      isTargetConnectionTested = targetConnection.isTested;
    } else {
      // Validate requirements
      if (!validateExternalSystem(integrationTemplate.targetSystem)) {
        throw new InternalServerErrorException('Stuff is messed up');
      }

      const assets =
        companyIntegrationAndConnectionUtilities.mapExternalSystemRequirementsToCompanyAssets(
          integrationTemplate.targetSystem.requirements,
        );

      try {
        let createdTargetConnection =
          await this.cateringCompanyDbHandler.createExternalSystemConnection(
            companyId,
            integrationTemplate.srcSystemId,
            integrationTemplate.srcSystem.uiName,
            assets,
          );
        targetConnectionId = createdTargetConnection.id;

        if (
          createdTargetConnection.isFullyConfigured ||
          companyIntegrationAndConnectionUtilities.isFullOutboundConfigured(
            createdTargetConnection.assets,
          )
        ) {
          createdTargetConnection = await this.testConnectionAndUpdateOnPass(
            companyId,
            createdTargetConnection,
          );
        }
        isTargetConnectionTested = createdTargetConnection.isTested;
      } catch (err) {
        // Should not have errored here - log at least
      }
    }

    // Type narrowing
    if (
      !(
        typeof srcConnectionId === 'string' &&
        typeof targetConnectionId === 'string'
      )
    ) {
      // Log
      throw new Error('Stuff is messed up');
    }

    // Create integration
    const record = await this.cateringCompanyDbHandler.createIntegration(
      companyId,
      templateId,
      integrationTemplate.uiName,
      srcConnectionId,
      targetConnectionId,
      integrationTemplate.event,
      creatorId,
      isSrcConnectionTested && isTargetConnectionTested,
    );

    return record;
  }

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

  /**
   *
   * @param companyId
   * @param systemId
   * @returns
   */
  async createExternalSystemConnection(companyId: string, systemId: number) {
    // Retrieve validated external system
    const externalSystem =
      await this.systemIntegrationDbHandler.getExternalSystem(
        systemId,
        companyId,
      );

    // Map external system assets to company assets
    const assets =
      companyIntegrationAndConnectionUtilities.mapExternalSystemRequirementsToCompanyAssets(
        externalSystem.requirements,
      );

    let record =
      await this.cateringCompanyDbHandler.createExternalSystemConnection(
        companyId,
        systemId,
        externalSystem.uiName,
        assets,
      );

    /**
     * This condition is true if the record contains 0 required outbound assets
     */
    if (
      record.isFullyConfigured ||
      companyIntegrationAndConnectionUtilities.isFullOutboundConfigured(
        record.assets,
      )
    ) {
      // Test it
      record = await this.testConnectionAndUpdateOnPass(companyId, record);
    }

    return record;
  }

  async updateExternalSystemConnection(
    connectionId: string,
    updates: Pick<
      Prisma.CompanyExternalSystemConnectionUncheckedUpdateInput,
      'isFullyConfigured' | 'isTested' | 'assets'
    >,
  ) {
    await this.cateringCompanyDbHandler.updateExternalySystemConnection(
      connectionId,
      updates,
    );
  }

  async updateConnectionAsset(
    companyId: string,
    connectionId: string,
    requirementType: RequirementType,
    value: any,
  ) {
    // Determine secret status
    const { assets, ...connection } =
      await this.cateringCompanyDbHandler.getConnectionWithValidatedAssets(
        connectionId,
      );

    if (connection.companyId !== companyId) {
      throw new ConflictException();
    }

    const targetAsset = assets[requirementType];
    if (!targetAsset) {
      throw new BadRequestException(
        'This connection does not have the specified requirement type',
      );
    }

    // If secret, store secret
    let assetValue;
    if (targetAsset.isSecret) {
      // const secretName = this.secretManager.getSecretName(companyId, asset.id);
      assetValue = `${companyId}_${connectionId}_${requirementType}`;
      console.log('*** SECRET NAME *** ', assetValue);

      try {
        const secretBuffer = Buffer.from(value);
        await this.secretManager.upsertSecret(assetValue, secretBuffer);

        // Do something special if this fails. Maybe it should be handled in upsertSecret.
      } catch (err) {
        // Should log
        throw new InternalServerErrorException(
          'The secret could not be stored. The asset has been deleted. Please try again, and if it does not work, contact support.',
        );
      }
    } else {
      assetValue = value;
    }

    // Update
    try {
      // Update assets
      assets[requirementType] = {
        ...targetAsset,
        status: 'UNTESTED', // See `assetStatuses`
        value: assetValue,
      };
      await this.cateringCompanyDbHandler.updateExternalySystemConnection(
        connectionId,
        { assets },
      );
    } catch (err) {
      const msg = targetAsset.isSecret
        ? 'Secret created, but name not stored.'
        : 'Asset value not stored';
      throw new InternalServerErrorException(msg);
    }

    if (
      companyIntegrationAndConnectionUtilities.isFullOutboundConfigured(assets)
    ) {
      const testResult = await this.companyExternalSystemService.testConnection(
        companyId,
        assets,
      );

      const updatedStatus = 'TEST_SUCCEEDED';
      if (!assetStatuses.includes(updatedStatus)) {
        // log this
        throw new InternalServerErrorException('Bad update status');
      }

      let newlyActivatableIntegrations: CompanyIntegration[] = [];
      if (testResult) {
        // Carry out connection initializations
        for (const assetType in assets) {
          const asset = assets[assetType as RequirementType];
          if (!asset) {
            continue;
          }

          // Connection test passed - all outbound assets are tested
          if (asset.direction == 'OUT') {
            asset.status == updatedStatus;
          }
        }

        await this.updateExternalSystemConnection(connectionId, {
          isFullyConfigured: true,
          isTested: true,
          assets,
        });

        newlyActivatableIntegrations =
          await this.cateringCompanyDbHandler.getAllConfiguredAndTestedIntegrationByConnectionId(
            connectionId,
          );
      }

      return newlyActivatableIntegrations;
    }
  }

  /**
   *
   * @param companyId
   * @param record
   * @returns
   */
  async testConnectionAndUpdateOnPass(
    companyId: string,
    record: CompanyConnectionWithTypedAssets,
  ): Promise<CompanyConnectionWithTypedAssets> {
    const isTested = await this.companyExternalSystemService.testConnection(
      companyId,
      record.assets,
    );

    const recordCopy = { ...record };

    if (isTested) {
      await this.cateringCompanyDbHandler.updateExternalySystemConnection(
        record.id,
        { isTested: true },
      );
      recordCopy.isTested = true;
    } else {
      // TODO LOG
      // This represents a fundamental problem with the application
    }
    return recordCopy;
  }
}
