import { CompanyIntegration, CompanyIntegrationAsset } from '@prisma/client';

export type CompanyIntegrationAssetWithIntegrations =
  CompanyIntegrationAsset & {
    integrations: Pick<CompanyIntegration, 'id'>[];
  };
