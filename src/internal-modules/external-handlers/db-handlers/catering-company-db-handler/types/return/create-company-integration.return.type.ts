import {
  CompanyIntegration,
  CompanyIntegrationAsset,
  IntegrationRequirement,
} from '@prisma/client';

export type CreatedCompanyIntegration = {
  companyIntegration: CompanyIntegration & {
    assets: CompanyIntegrationAsset[];
  };
  invalidMenuRequirements: IntegrationRequirement[];
};
