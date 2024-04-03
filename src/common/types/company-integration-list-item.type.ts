import { $Enums, CompanyIntegration } from '@prisma/client';
import { IntegrationEventOutput } from 'src/internal-modules/catering-company/company-mapper.service';

export type CompanyIntegrationListItem = CompanyIntegration & {
  template: {
    srcSystem: $Enums.ExternalSystem;
    srcEntity: $Enums.ExternalEntity;
    targetSystem: $Enums.ExternalSystem;
    targetEntity: $Enums.ExternalEntity;
  };
};

export type CompanyIntegrationOutputItem = Pick<
  CompanyIntegration,
  'isConfigured' | 'isActive' | 'createdAt'
> & {
  template: { src: string; target: string };
  event: IntegrationEventOutput;
};
