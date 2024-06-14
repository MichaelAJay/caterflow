import { Injectable } from '@nestjs/common';
import {
  $Enums,
  CompanyExternalSystemConnectionAsset,
  ExternalSystem,
  ExternalSystemConnectionRequirement,
} from '@prisma/client';
import { EzCaterHandlerService } from 'src/internal-modules/external-handlers/ezcater-handler/ezcater-handler.service';

type SystemRequirementInput = ExternalSystemConnectionRequirement & {
  companyConnectionAssets: CompanyExternalSystemConnectionAsset[];
};

type ExternalSystemInput = ExternalSystem & {
  connectionRequirements: SystemRequirementInput[];
};

@Injectable()
export class CompanyExternalSystemService {
  constructor(private readonly ezCaterHandler: EzCaterHandlerService) {}

  async testConnection(
    companyId: string,
    systemWithRequirementsAndAssets: ExternalSystemInput, // ALL system's requirements must be included
  ): Promise<boolean> {
    // usefulMap values represent connection assets which assuredly belong to the target company
    const usefulMap = new Map<
      $Enums.ExternalSystemConnectionRequirementType,
      CompanyExternalSystemConnectionAsset
    >();
    const { connectionRequirements, name: externalSystemName } =
      systemWithRequirementsAndAssets;

    const missingCompanyAssetTypes: $Enums.ExternalSystemConnectionRequirementType[] =
      [];
    for (const requirement of connectionRequirements) {
      const companyAsset = requirement.companyConnectionAssets.find(
        (asset) => asset.companyId === companyId,
      );
      if (!companyAsset) {
        missingCompanyAssetTypes.push(requirement.type);
        continue;
      }
      usefulMap.set(requirement.type, companyAsset);
    }
    if (missingCompanyAssetTypes.length > 0) {
      // Should probably just log - it should throw in the switch statement
      throw new Error(
        `Missing company asset types: ${missingCompanyAssetTypes.join(', ')}`,
      );
    }

    // Assets are either on value, or retrieved by secret
    // Specifically validate length as hard-coded number of expected requirements - for double failsafe
    switch (externalSystemName) {
      case $Enums.ExternalSystemName.EZ_CATER:
        const EXPECTED_MAP_SIZE = 1;

        if (usefulMap.size !== EXPECTED_MAP_SIZE) {
          throw new Error(
            `Expected ${EXPECTED_MAP_SIZE} assets, got ${usefulMap.size}.`,
          );
        }

        // Specify required properties
        const apiKeyAsset = usefulMap.get(
          $Enums.ExternalSystemConnectionRequirementType.API_KEY,
        );
        if (!apiKeyAsset) {
          throw new Error('Missing api key asset');
        }

        const test = await this.ezCaterHandler.getCaterers(
          companyId,
          apiKeyAsset.id,
        );
        return !!test;
      case $Enums.ExternalSystemName.NUTSHELL:
        return false;
      default:
        throw new Error(`Invalid external system ${externalSystemName}`);
    }
  }

  async initializeConnection();
}
