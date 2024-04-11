import { $Enums } from '@prisma/client';
import { ResponseIntegrationTemplateEvent } from '../../types/mapped/response-integration-template.type';

export const RESPONSE_INTEGRATION_TEMPLATE_EVENT_MAPPER: Record<
  $Enums.IntegrationEvent,
  ResponseIntegrationTemplateEvent
> = {
  ezCaterOrderReceived: 'ezCater Order Received',
};
