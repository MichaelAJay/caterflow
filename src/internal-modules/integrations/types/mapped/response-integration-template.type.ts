import { IntegrationRequirement, IntegrationTemplate } from '@prisma/client';

export type ResponseIntegrationTemplateEvent = 'ezCater Order Received';

type ResponseIntegrationRequirement = Pick<
  IntegrationRequirement,
  'id' | 'system' | 'level'
> & {};

export type ResponseIntegrationTemplate = Pick<
  IntegrationTemplate,
  'id' | 'srcSystem' | 'srcEntity' | 'targetSystem' | 'targetEntity'
> & {
  event: ResponseIntegrationTemplateEvent;
  requirements: ResponseIntegrationRequirement[];
};
