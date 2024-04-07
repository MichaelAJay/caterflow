import {
  CompanyIntegration,
  CompanyIntegrationAsset,
  IntegrationRequirement,
} from '@prisma/client';

type IntegrationRequirementWithAsset = IntegrationRequirement & {
  assets: Pick<
    CompanyIntegrationAsset,
    | 'id'
    | 'menuId'
    | 'integrationRequirementId'
    | 'type'
    | 'system'
    | 'isTested'
  >[];
};

export type CreatedCompanyIntegration = {
  companyIntegration: CompanyIntegration;
  metRequirements: IntegrationRequirementWithAsset[];
  unmetRequirements: IntegrationRequirementWithAsset[];
};
