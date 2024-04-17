import { IntegrationRequirement, IntegrationTemplate } from '@prisma/client';

export type IntegrationRequirementWithCompanyAssociations =
  IntegrationRequirement & {
    assets: { id: string }[];
    templates: (IntegrationTemplate & { integrations: { id: string }[] })[];
  };
