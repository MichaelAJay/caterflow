import { IntegrationRequirement, IntegrationTemplate } from '@prisma/client';

export type ResponseIntegrationTemplateEvent = 'ezCater Order Received';

export type ResponseIntegrationRequirementType =
  | 'API Configuration'
  | 'Data map';

type ResponseIntegrationRequirement = Pick<
  IntegrationRequirement,
  'id' | 'system' | 'level'
> & {
  type: ResponseIntegrationRequirementType;
  fields: {
    name: string;
    isSecret: boolean;
  }[];
};

export type ResponseIntegrationTemplate = Pick<
  IntegrationTemplate,
  'id' | 'srcSystem' | 'srcEntity' | 'targetSystem' | 'targetEntity'
> & {
  event: ResponseIntegrationTemplateEvent;
  requirements: ResponseIntegrationRequirement[];
};
