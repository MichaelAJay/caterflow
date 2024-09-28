import {
  Asset,
  AssetStatusValues,
  CompanyConnectionAsset,
} from '../../external-handlers/db-handlers/catering-company-db-handler/types/company_connection_assets';
import {
  ConnectionDirectionValues,
  ExternalSystemRequirements,
  RequirementType,
  validateRequirementType,
} from '../../external-handlers/db-handlers/catering-company-db-handler/types/external_systems_requirements';

const companyIntegrationAndConnectionUtilities = {
  mapExternalSystemRequirementsToCompanyAssets: (
    externalSystemRequirements: ExternalSystemRequirements,
  ): CompanyConnectionAsset => {
    const assets: CompanyConnectionAsset = {};
    for (const requirement in externalSystemRequirements) {
      // Ensure key is from the RequirementType string literal
      if (!validateRequirementType(requirement)) {
        // Should log
        // Should create company issue
        continue;
      }

      const assetSeed = externalSystemRequirements[requirement];

      if (!assetSeed) {
        // should log
        continue;
      }

      assets[requirement] = {
        ...assetSeed,
        status: 'UNCONFIGURED',
      };
    }
    return assets;
  },
  isFullOutboundConfigured: (assets: CompanyConnectionAsset): boolean => {
    return !Object.values(assets).some(
      (asset) => asset.direction == 'OUT' && asset.status == 'UNCONFIGURED',
    );
  },
  isOneWayConfigured: (
    assets: CompanyConnectionAsset,
    dir: ConnectionDirectionValues,
  ) => {
    return !Object.values(assets).some(
      (asset) => asset.direction === dir && asset.status === 'UNCONFIGURED',
    );
  },
  updateAssetStatus: (
    assetsIn: CompanyConnectionAsset,
    status: AssetStatusValues,
    dir?: ConnectionDirectionValues, // If dir not included, ALL updated
  ): CompanyConnectionAsset => {
    const assetsOut: CompanyConnectionAsset = {};
    for (const assetType in assetsIn) {
      const assetName = assetType as RequirementType;
      const asset = assetsIn[assetName] as Asset;

      // Update status if dir isn't included, OR if dir is included & asset direction matches
      if (!dir || asset.direction === dir) {
        asset.status = status;
      }
      assetsOut[assetName] = asset;
    }
    return assetsOut;
  },
};

export default companyIntegrationAndConnectionUtilities;
