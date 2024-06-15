import { Injectable } from '@nestjs/common';
import { $Enums, ExternalSystem } from '@prisma/client';
import { CompanyConnectionAsset } from 'src/internal-modules/external-handlers/db-handlers/catering-company-db-handler/types/company_connection_assets';
import {
  ExternalSystemRequirements,
  Requirement,
  RequirementType,
} from 'src/internal-modules/external-handlers/db-handlers/catering-company-db-handler/types/external_systems_requirements';
import { EzCaterHandlerService } from 'src/internal-modules/external-handlers/ezcater-handler/ezcater-handler.service';

@Injectable()
export class CompanyExternalSystemService {
  constructor(private readonly ezCaterHandler: EzCaterHandlerService) {}

  async validateConnectionOutRequirements(
    companyConnectionAssets: CompanyConnectionAsset,
  ): Promise<boolean> {
    // Assets are either on value, or retrieved by secret
    // Specifically validate length as hard-coded number of expected requirements - for double failsafe

    // If there exists some OUT asset with an undefined value, return false
    // Else return true

    // There exists some OUT asset with an undefined value
    return !Object.values(companyConnectionAssets).some(
      (asset) => asset.direction === 'OUT' && asset.value === undefined,
    );
  }

  async validateConnectionInRequirements(
    companyConnectionAssets: CompanyConnectionAsset,
  ): Promise<boolean> {
    return !Object.values(companyConnectionAssets).some(
      (asset) => asset.direction === 'IN' && typeof asset.value === 'undefined',
    );
  }

  async testConnection(
    companyId: string,
    externalSystemName: $Enums.ExternalSystemName,
    systemRequirements: ExternalSystemRequirements, // ALL system's requirements must be included
    companyConnectionAssets: CompanyConnectionAsset,
  ): Promise<boolean> {
    return true;
  }

  async initializeConnection() {}
}
