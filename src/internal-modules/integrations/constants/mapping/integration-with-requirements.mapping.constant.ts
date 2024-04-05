import { $Enums } from '@prisma/client';
import {
  ResponseIntegrationRequirementType,
  ResponseIntegrationTemplateEvent,
} from '../../types/mapped/response-integration-template.type';

export const RESPONSE_INTEGRATION_TEMPLATE_EVENT_MAPPER: Record<
  $Enums.IntegrationEvent,
  ResponseIntegrationTemplateEvent
> = {
  ezCaterOrderReceived: 'ezCater Order Received',
};

export const RESPONSE_INTEGRATION_REQUIREMENT_TYPE_MAPPER: Record<
  $Enums.IntegrationAssetType,
  ResponseIntegrationRequirementType
> = {
  apiConfiguration: 'API Configuration',
  dataMap: 'Data map',
};
