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
import { Prisma } from '@prisma/client';
import {
  RequirementType,
  isRequirementType,
} from 'src/internal-modules/external-handlers/db-handlers/catering-company-db-handler/types/external_systems_requirements';
import { validateCompanyExternalSystemConnectionAssets } from 'src/internal-modules/external-handlers/db-handlers/catering-company-db-handler/validators/company_external_connection_assets.validator';
import { assetStatuses } from 'src/internal-modules/external-handlers/db-handlers/catering-company-db-handler/types/company_connection_assets';

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
      'isFullyConfigured' | 'isTested' | 'assets'
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
  async updateConnectionAsset(
    companyId: string,
    connectionId: string,
    requirementType: RequirementType,
    value: any,
  ) {
    // Determine secret status
    const connection = await this.cateringCompanyDbHandler.getConnection(
      connectionId,
      {},
    );
    if (connection.companyId !== companyId) {
      throw new ConflictException();
    }
    const { assets } = connection;
    if (!validateCompanyExternalSystemConnectionAssets(assets)) {
      // log
      throw new InternalServerErrorException('Bad assets');
    }

    const targetAsset = assets[requirementType];
    if (!targetAsset) {
      throw new BadRequestException(
        'This connection does not have the specified requirement type',
      );
    }
    console.log(targetAsset);

    // If secret, store secret
    if (targetAsset.isSecret) {
      // const secretName = this.secretManager.getSecretName(companyId, asset.id);
      const secretName = `${companyId}_${connectionId}_${requirementType}`;
      console.log('*** SECRET NAME *** ', secretName);

      try {
        const secretBuffer = Buffer.from(value);
        await this.secretManager.upsertSecret(secretName, secretBuffer);
        // Do something special if this fails. Maybe it should be handled in upsertSecret.

        try {
          // Update assets
          assets[requirementType] = {
            ...targetAsset,
            status: 'UNTESTED', // See `assetStatuses`
            value: secretName,
          };
          await this.cateringCompanyDbHandler.updateExternalySystemConnection(
            connectionId,
            { assets },
          );
        } catch (err) {
          throw new InternalServerErrorException(
            'Secret created, but name not stored.',
          );
        }
      } catch (err) {
        // Should log
        throw new InternalServerErrorException(
          'The secret could not be stored. The asset has been deleted. Please try again, and if it does not work, contact support.',
        );
      }
    }

    // Determine if asset means that the matching connection is fully configured
    // This should be a method in another class
    // const assetValues = Object.values(assets);
    // const outboundAssetValues = assetValues.filter(value => value.direction === 'OUT');
    // const areAllOutboundAssetsConfigured = outboundAssetValues.every(value => )
    let fullOutboundConfigured = true;
    for (const assetType in assets) {
      if (!isRequirementType(assetType)) {
        continue;
      }
      const asset = assets[assetType];
      if (!asset) {
        continue;
      }
      if (asset.direction == 'OUT' && asset.status == 'UNCONFIGURED') {
        fullOutboundConfigured = false;
        break;
      }
    }

    // WARNING: Right now, this is mutating assets
    if (fullOutboundConfigured) {
      const testResult = await this.companyExternalSystemService.testConnection(
        companyId,
        assets,
      );

      const updatedStatus = 'TEST_SUCCEEDED';
      if (!assetStatuses.includes(updatedStatus)) {
        // log this
        throw new InternalServerErrorException('Bad update status');
      }
      if (testResult) {
        // Carry out connection initializations
        for (const assetType in assets) {
          if (!isRequirementType(assetType)) {
            continue;
          }
          const asset = assets[assetType];
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

        // Now, if the external system connection was updated, it's possible that any integrations associated with this connection are also ready to use
        // We need all external services for which the connection is the source or the target
        // We need to check all of those external services and we need to return any which are eligible for activating
      }
      // This should cascade all the way up to company integrations
    } else {
      // What went wrong?
    }
  }
}
