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
import {
  $Enums,
  CompanyIntegration,
  ExternalSystem,
  Prisma,
} from '@prisma/client';
import {
  Requirement,
  RequirementType,
} from 'src/internal-modules/external-handlers/db-handlers/catering-company-db-handler/types/external_systems_requirements';
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

    const createConnectionHelper = async (
      companyId: string,
      systemId: number,
      uiName: string,
      requirements: Partial<
        Record<'API_KEY' | 'API_USERNAME' | 'WEBHOOK_SECRET', Requirement>
      >,
    ): Promise<{ id: string; isReady: boolean }> => {
      const result = { id: '', isReady: false };

      const { id, outboundStatus } = await this.createExternalSystemConnection(
        companyId,
        { id: systemId, uiName, requirements },
      );
      result.id = id;
      result.isReady = outboundStatus === $Enums.ConnectionOutboundStatus.READY;
      return result;
    };

    // If connection found, prepare to connect it directly to the integration
    let srcConnectionId: string | undefined = undefined;
    let isSrcConnectionReady = false;
    if (srcConnection) {
      srcConnectionId = srcConnection.id;
      isSrcConnectionReady =
        srcConnection.outboundStatus === $Enums.ConnectionOutboundStatus.READY;
    } else {
      const { id, isReady } = await createConnectionHelper(
        companyId,
        integrationTemplate.srcSystemId,
        integrationTemplate.srcSystem.uiName,
        integrationTemplate.srcSystem.requirements,
      );

      srcConnectionId = id;
      isSrcConnectionReady = isReady;
    }

    let targetConnectionId: string | undefined = undefined;
    let isTargetConnectionReady = false;
    if (targetConnection) {
      targetConnectionId = targetConnection.id;
      isTargetConnectionReady =
        targetConnection.outboundStatus ===
        $Enums.ConnectionOutboundStatus.READY;
    } else {
      const { id, isReady } = await createConnectionHelper(
        companyId,
        integrationTemplate.targetSystemId,
        integrationTemplate.targetSystem.uiName,
        integrationTemplate.targetSystem.requirements,
      );

      srcConnectionId = id;
      isSrcConnectionReady = isReady;
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
      isSrcConnectionReady && isTargetConnectionReady,
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
  async createExternalSystemConnection(
    companyId: string,
    systemData:
      | number
      | {
          id: number;
          uiName: string;
          requirements: Partial<
            Record<'API_KEY' | 'API_USERNAME' | 'WEBHOOK_SECRET', Requirement>
          >;
        },
  ) {
    const { id, uiName, requirements } =
      typeof systemData === 'number'
        ? await this.systemIntegrationDbHandler.getExternalSystem(
            systemData,
            companyId,
          )
        : systemData;

    // Map external system assets to company assets
    const assets =
      companyIntegrationAndConnectionUtilities.mapExternalSystemRequirementsToCompanyAssets(
        requirements,
      );

    let record =
      await this.cateringCompanyDbHandler.createExternalSystemConnection(
        companyId,
        id,
        uiName,
        assets,
      );

    /**
     * This condition is true if the record contains 0 required outbound assets
     */
    if (
      record.outboundStatus ===
      $Enums.ConnectionOutboundStatus.CONFIGURED_UNTESTED
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
      'outboundStatus' | 'assets'
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
          outboundStatus: $Enums.ConnectionOutboundStatus.READY,
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
        { outboundStatus: $Enums.ConnectionOutboundStatus.READY },
      );
      recordCopy.outboundStatus = $Enums.ConnectionOutboundStatus.READY;
    } else {
      // TODO LOG
      // This means that the application thought that the connection was outbound-ready, but it wasn't
    }
    return recordCopy;
  }
}
