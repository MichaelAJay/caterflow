import { CompanyIntegration, CompanyIntegrationAsset } from '@prisma/client';

export type GetCompanyIntegrationWithAssets = CompanyIntegration & {
  assets: CompanyIntegrationAsset[];
};
