import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CompanyExternalSystemService } from '../company-external-system/company-external-system.service';
import { IBuildGetCompanyIntegrationListArgs } from '../../external-handlers/db-handlers/catering-company-db-handler/interfaces/query-builder-args.interfaces';
import { CateringCompanyDbHandlerService } from '../../external-handlers/db-handlers/catering-company-db-handler/catering-company-db-handler.service';
import { SystemIntegrationDbHandlerService } from '../../external-handlers/db-handlers/catering-company-db-handler/system-integration-db-handler.service';
import { $Enums, Prisma } from '@prisma/client';
import {
  connectionDirection,
  ConnectionDirectionValues,
  Requirement,
  RequirementType,
} from '../../external-handlers/db-handlers/catering-company-db-handler/types/external_systems_requirements';
import {
  Asset,
  AssetStatus,
  AssetStatusValues,
  CompanyConnectionAsset,
  CompanyConnectionWithTypedAssets,
} from '../../external-handlers/db-handlers/catering-company-db-handler/types/company_connection_assets';
import companyIntegrationAndConnectionUtilities from '../utility/company-integration-and-connection.utilities';
import { CryptoService } from '../../../system/modules/crypto/crypto.service';

@Injectable()
export class CompanyIntegrationAndConnectionService {
  constructor(
    private readonly companyExternalSystemService: CompanyExternalSystemService,
    private readonly cateringCompanyDbHandler: CateringCompanyDbHandlerService,
    private readonly systemIntegrationDbHandler: SystemIntegrationDbHandlerService,
    private readonly cryptoService: CryptoService,
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
        [
          integrationTemplate.srcSystemName,
          integrationTemplate.targetSystemName,
        ],
      );

    const srcConnection = existingConnections.find(
      (connection) =>
        connection.systemName === integrationTemplate.srcSystemName,
    );
    const targetConnection = existingConnections.find(
      (connection) =>
        connection.systemName === integrationTemplate.targetSystemName,
    );

    const createConnectionHelper = async (
      companyId: string,
      externalSystemName: $Enums.ExternalSystemName,
      uiName: string,
      requirements: Partial<
        Record<'API_KEY' | 'API_USERNAME' | 'WEBHOOK_SECRET', Requirement>
      >,
    ): Promise<{ id: string; isReady: boolean }> => {
      const result = { id: '', isReady: false };

      const { id, outboundStatus } = await this.createExternalSystemConnection(
        companyId,
        { name: externalSystemName, uiName, requirements },
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
      | $Enums.ExternalSystemName
      | {
          name: $Enums.ExternalSystemName;
          uiName: string;
          requirements: Partial<
            Record<'API_KEY' | 'API_USERNAME' | 'WEBHOOK_SECRET', Requirement>
          >;
        },
  ) {
    let externalSystem: {
      name: $Enums.ExternalSystemName;
      uiName: string;
      requirements: Partial<
        Record<'API_KEY' | 'API_USERNAME' | 'WEBHOOK_SECRET', Requirement>
      >;
    };
    if (typeof systemData === 'string') {
      const { connectionId, ...retrievedExternalSystem } =
        await this.systemIntegrationDbHandler.getExternalSystem(
          systemData,
          companyId,
        );
      if (connectionId) {
        // Could be our fault too... but creating a company error message should suffice
        throw new Error(
          'Client error - external system already exists for client',
        );
      }
      externalSystem = {
        name: retrievedExternalSystem.name,
        uiName: retrievedExternalSystem.uiName,
        requirements: retrievedExternalSystem.requirements,
      };
    } else {
      externalSystem = { ...systemData };
    }

    const { name, uiName, requirements } = externalSystem;

    // Map external system assets to company assets
    const assets =
      companyIntegrationAndConnectionUtilities.mapExternalSystemRequirementsToCompanyAssets(
        requirements,
      );

    let record =
      await this.cateringCompanyDbHandler.createExternalSystemConnection(
        companyId,
        name,
        uiName,
        assets,
      );

    /** May be 'UNCONFIGURED' (DEFAULT) or 'CONFIGURED_UNTESTED' */
    const { outboundStatus } = record;
    if (outboundStatus === $Enums.ConnectionStatus.CONFIGURED_UNTESTED) {
      record = await this.testConnectionOutAndUpdate(companyId, record);
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

    const assetValue = targetAsset.isSecret
      ? await this.cryptoService.encrypt(value)
      : value;

    /**
     * Start new section
     */
    // Update assets
    assets[requirementType] = {
      ...targetAsset,
      status: AssetStatus.Untested, // See `assetStatuses`
      value: assetValue,
    };

    let updatedConnection: CompanyConnectionWithTypedAssets;
    if (
      companyIntegrationAndConnectionUtilities.isOneWayConfigured(
        assets,
        targetAsset.direction,
      )
    ) {
      // Is either one way configured out or in
      if (targetAsset.direction === connectionDirection.Out) {
        updatedConnection = await this.testConnectionOutAndUpdate(companyId, {
          ...connection,
          assets,
        });
      } else {
        // con dir in
        const updatedAssets =
          companyIntegrationAndConnectionUtilities.updateAssetStatus(
            assets,
            AssetStatus.Untested,
            connectionDirection.In,
          );

        updatedConnection =
          await this.cateringCompanyDbHandler.updateExternalSystemConnection(
            connectionId,
            {
              inboundStatus: $Enums.ConnectionStatus.CONFIGURED_UNTESTED,
              assets: updatedAssets,
            },
          );
      }

      // whichever one it was is finished
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

      await processCompanyIntegrationsWithUpdatedAsset(
        updatedConnection,
        targetAsset.direction,
      );
    } else {
      updatedConnection =
        await this.cateringCompanyDbHandler.updateExternalSystemConnection(
          connectionId,
          { assets },
        );
    }

    /**
     * End new section
     */
    return updatedConnection;
  }

  /**
   * This happens when a previously-existing company connection's asset is updated
   * @returns - A CompanyConnection with updated in or outbound status (depending on updated asset dir) & updated asset status (for the given dir)
   */
  async processCompanyConnectionWithUpdatedAsset(
    connection: CompanyConnectionWithTypedAssets,
    assetName: RequirementType,
    externalSystemName: $Enums.ExternalSystemName,
    assetValue: string,
  ): Promise<CompanyConnectionWithTypedAssets> {
    const { id, companyId, assets } = connection;

    const targetAsset = assets[assetName];
    if (!targetAsset) {
      throw new Error('Oops I did it again');
    }

    const dir = targetAsset.direction;
    if (!dir) {
      // log
      throw new Error('Bad process');
    }

    const asset: Asset = {
      ...targetAsset,
      status: AssetStatus.Untested,
      value: assetValue,
    };
    const updatedAssets: CompanyConnectionAsset = {
      ...assets,
      [assetName]: asset,
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

    const updatedConnection = await this.testConnectionOutAndUpdate(
      companyId,
      connection,
    );

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
   * Runs testOutbound
   * Then if tested, updateAssetStatus w/ "out"
   * Then update external system connection (will update outboundStatus and assets if tested)
   */
  async testConnectionOutAndUpdate(
    companyId: string,
    record: CompanyConnectionWithTypedAssets,
  ): Promise<CompanyConnectionWithTypedAssets> {
    const testResult =
      await this.companyExternalSystemService.testOutboundConnection(
        record.systemName,
        companyId,
        record.assets,
      );

    let outboundStatus: $Enums.ConnectionStatus;
    let updates: Pick<
      Prisma.CompanyExternalSystemConnectionUncheckedUpdateInput,
      'outboundStatus' | 'assets'
    >;
    if (testResult.tested) {
      let assetStatus: AssetStatusValues;
      if (testResult.passed) {
        outboundStatus = $Enums.ConnectionStatus.READY;
        assetStatus = AssetStatus.Test_Succeeded;
      } else {
        // Log for company and return useful information
        outboundStatus = $Enums.ConnectionStatus.TEST_FAILED;
        assetStatus = AssetStatus.Test_Failed;
      }
      const asset = companyIntegrationAndConnectionUtilities.updateAssetStatus(
        record.assets,
        assetStatus,
        connectionDirection.Out,
      );
      updates = { outboundStatus, assets: asset };
    } else if (testResult.reason === 'NOT_APPLICABLE') {
      // Not Tested - connection does not make external requests
      outboundStatus = $Enums.ConnectionStatus.NOT_APPLICABLE;
      updates = { outboundStatus };
    } else {
      // Error - log
      throw new Error('oops i did it again');
    }

    return await this.cateringCompanyDbHandler.updateExternalSystemConnection(
      record.id,
      updates,
    );
  }
}
