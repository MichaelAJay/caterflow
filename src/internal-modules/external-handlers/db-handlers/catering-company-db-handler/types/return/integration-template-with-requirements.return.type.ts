import { IntegrationRequirement, IntegrationTemplate } from '@prisma/client';

export type IntegrationTemplateWithRequirements = IntegrationTemplate & {
  requirements: IntegrationRequirement[];
};
