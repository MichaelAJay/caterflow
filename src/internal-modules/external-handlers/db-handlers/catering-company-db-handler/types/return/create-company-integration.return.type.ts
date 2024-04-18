import {
  CompanyIntegration,
  CompanyIntegrationAsset,
  IntegrationRequirement,
} from '@prisma/client';

export type InvalidMenuRequirement = Pick<
  IntegrationRequirement,
  'id' | 'type' | 'system'
>;

export type CreatedCompanyIntegration = {
  companyIntegration: CompanyIntegration & {
    assets: CompanyIntegrationAsset[];
  };
  invalidMenuRequirements: InvalidMenuRequirement[];
};
