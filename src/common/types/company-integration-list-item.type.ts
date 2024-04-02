import { $Enums, CompanyIntegration } from '@prisma/client';

export type CompanyIntegrationListItem = CompanyIntegration & {
  template: {
    srcSystem: $Enums.ExternalSystem;
    srcEntity: $Enums.ExternalEntity;
    targetSystem: $Enums.ExternalSystem;
    targetEntity: $Enums.ExternalEntity;
  };
};
