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
import { $Enums, CompanyIntegration, Prisma } from '@prisma/client';
import {
  connectionDirection,
  ConnectionDirectionValues,
  Requirement,
  RequirementType,
} from 'src/internal-modules/external-handlers/db-handlers/catering-company-db-handler/types/external_systems_requirements';
import {
  assetStatus,
  CompanyConnectionAsset,
  CompanyConnectionWithTypedAssets,
} from 'src/internal-modules/external-handlers/db-handlers/catering-company-db-handler/types/company_connection_assets';
import companyIntegrationAndConnectionUtilities from '../utility/company-integration-and-connection.utilities';

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
      externalSystemName: $Enums.ExternalSystemName,
      uiName: string,
      requirements: Partial<
        Record<'API_KEY' | 'API_USERNAME' | 'WEBHOOK_SECRET', Requirement>
      >,
    ): Promise<{ id: string; isReady: boolean }> => {
      const result = { id: '', isReady: false };

      const { id, outboundStatus } = await this.createExternalSystemConnection(
        companyId,
        { id: systemId, name: externalSystemName, uiName, requirements },
      );
      result.id = id;
      result.isReady = outboundStatus === $Enums.ConnectionStatus.READY;
      return result;
    };

    // If connection found, prepare to connect it directly to the integration
    let srcConnectionId: string | undefined = undefined;
    let isSrcConnectionReady = false;
    if (srcConnection) {
      srcConnectionId = srcConnection.id;
      isSrcConnectionReady =
        srcConnection.inboundStatus === $Enums.ConnectionStatus.READY ||
        // No formal testing procedure for inbound configuration testing
        srcConnection.inboundStatus ===
          $Enums.ConnectionStatus.CONFIGURED_UNTESTED;
    } else {
      const { id, isReady } = await createConnectionHelper(
        companyId,
        integrationTemplate.srcSystemId,
        integrationTemplate.srcSystem.name,
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
        targetConnection.outboundStatus === $Enums.ConnectionStatus.READY;
    } else {
      const { id, isReady } = await createConnectionHelper(
        companyId,
        integrationTemplate.targetSystemId,
        integrationTemplate.targetSystem.name,
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
      'srcConnectionId' | 'targetConnectionId' | 'status'
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
          name: $Enums.ExternalSystemName;
          uiName: string;
          requirements: Partial<
            Record<'API_KEY' | 'API_USERNAME' | 'WEBHOOK_SECRET', Requirement>
          >;
        },
  ) {
    const { id, name, uiName, requirements } =
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

    const record =
      await this.cateringCompanyDbHandler.createExternalSystemConnection(
        companyId,
        id,
        uiName,
        assets,
      );

    /** May be 'UNCONFIGURED' (DEFAULT) or 'CONFIGURED_UNTESTED' */
    const { outboundStatus } = record;
    if (outboundStatus === $Enums.ConnectionStatus.CONFIGURED_UNTESTED) {
      await this.testConnectionAndUpdateOnPass(companyId, record, name);
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
    await this.cateringCompanyDbHandler.updateExternalSystemConnection(
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
    const { assets, externalSystem, ...connection } =
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
      await this.cateringCompanyDbHandler.updateExternalSystemConnection(
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
      const testResult =
        await this.companyExternalSystemService.testOutboundConnection(
          externalSystem.name,
          companyId,
          assets,
        );

      let newlyActivatableIntegrations: CompanyIntegration[] = [];
      if (testResult) {
        // Carry out connection initializations
        const updatedAssets =
          companyIntegrationAndConnectionUtilities.updateAssetStatus(
            assets,
            assetStatus.Test_Succeeded,
            connectionDirection.Out,
          );

        await this.updateExternalSystemConnection(connectionId, {
          outboundStatus: $Enums.ConnectionStatus.READY,
          assets: updatedAssets,
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
   * This happens when a previously-existing company connection's asset is updated
   * @returns - A CompanyConnection with updated in or outbound status (depending on updated asset dir) &  updated asset status (for the given dir)
   */
  async processCompanyConnectionWithUpdatedAsset(
    connection: CompanyConnectionWithTypedAssets,
    assetName: RequirementType,
    externalSystemName: $Enums.ExternalSystemName,
  ): Promise<CompanyConnectionWithTypedAssets> {
    const { id, companyId, assets } = connection;

    const dir = assets[assetName]?.direction;
    if (!dir) {
      // log
      throw new Error('Bad process');
    }

    let updatedAssets: CompanyConnectionAsset = {
      ...assets,
      [assetName]: assetStatus.Untested,
    };

    // Check configured
    if (
      !companyIntegrationAndConnectionUtilities.isOneWayConfigured(
        updatedAssets,
        dir,
      )
    ) {
      // Not ready
      return await this.cateringCompanyDbHandler.updateExternalSystemConnection(
        id,
        {
          assets: updatedAssets,
        },
      );
    }
    // !!! Is configured in the target direction !!!

    // Cannot directly test incoming (webhook) completion.
    if (dir === connectionDirection.In) {
      return await this.cateringCompanyDbHandler.updateExternalSystemConnection(
        id,
        {
          inboundStatus: $Enums.ConnectionStatus.CONFIGURED_UNTESTED,
          assets: updatedAssets,
        },
      );
    }

    // !!! IS OUT ASSET !!!

    // Test
    const isReady =
      await this.companyExternalSystemService.testOutboundConnection(
        externalSystemName,
        companyId,
        updatedAssets,
      );

    updatedAssets = companyIntegrationAndConnectionUtilities.updateAssetStatus(
      updatedAssets,
      isReady ? assetStatus.Test_Succeeded : assetStatus.Test_Failed,
      dir,
    );

    const updatedConnection =
      await this.cateringCompanyDbHandler.updateExternalSystemConnection(id, {
        outboundStatus:
          $Enums.ConnectionStatus[isReady ? 'READY' : 'TEST_FAILED'],
        assets: updatedAssets,
      });

    /**
     * MUST BE CALLED with the result of processCompanyConnectionWithUpdatedAsset
     */
    const processCompanyIntegrationsWithUpdatedAsset = async (
      companyConnection: CompanyConnectionWithTypedAssets,
      dir: ConnectionDirectionValues,
    ): Promise<any> => {
      // Direction validation & handler of incomplete connections
      switch (dir) {
        case connectionDirection.In:
          if (
            !(
              companyConnection.inboundStatus ===
                $Enums.ConnectionStatus.READY ||
              // Special case, since triggering a webhook test is not currently possible
              companyConnection.inboundStatus ===
                $Enums.ConnectionStatus.CONFIGURED_UNTESTED
            )
          ) {
            return [];
          }
          break;
        case connectionDirection.Out:
          if (
            companyConnection.outboundStatus !== $Enums.ConnectionStatus.READY
          ) {
            return [];
          }
          break;
        default:
          // This represents an error - there should only be the other two values
          // Log and throw
          throw new Error('A bad error has occurred');
      }

      await this.cateringCompanyDbHandler.updateIntegrationsByComplementaryConnectionId(
        companyConnection.id,
        dir,
      );
    };

    await processCompanyIntegrationsWithUpdatedAsset(updatedConnection, dir);

    return updatedConnection;
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
    externalSystemName: $Enums.ExternalSystemName,
  ): Promise<CompanyConnectionWithTypedAssets> {
    const isTested =
      await this.companyExternalSystemService.testOutboundConnection(
        externalSystemName,
        companyId,
        record.assets,
      );

    let recordCopy = { ...record };

    if (isTested) {
      recordCopy =
        await this.cateringCompanyDbHandler.updateExternalSystemConnection(
          record.id,
          { outboundStatus: $Enums.ConnectionStatus.READY },
        );
    } else {
      // TODO LOG
      // This means that the application thought that the connection was outbound-ready, but it wasn't
    }
    return recordCopy;
  }
}
