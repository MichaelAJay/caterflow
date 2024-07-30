import { CompanyConnectionAsset } from 'src/internal-modules/external-handlers/db-handlers/catering-company-db-handler/types/company_connection_assets';
import {
  ExternalSystemRequirements,
  validateRequirementType,
} from 'src/internal-modules/external-handlers/db-handlers/catering-company-db-handler/types/external_systems_requirements';

const companyIntegrationAndConnectionUtilities = {
  mapExternalSystemRequirementsToCompanyAssets: (
    externalSystemRequirements: ExternalSystemRequirements,
  ): CompanyConnectionAsset => {
    const assets: CompanyConnectionAsset = {};
    for (const requirement in externalSystemRequirements) {
      // Ensure key is from the RequirementType string literal
      if (!validateRequirementType(requirement)) {
        // Should log
        // Maybe should throw too
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
};

export default companyIntegrationAndConnectionUtilities;
