import { JSONSchemaType } from 'ajv';
import { IGetIntegrationQueryRequest } from '../../../common/types/get-integration-list-query-request.type';
import ajvSingleton from '../../../system/singletons/ajv.singleton';

const querySchema: JSONSchemaType<IGetIntegrationQueryRequest> = {
  type: 'object',
  properties: {
    pg: { type: 'string', pattern: '^\\d+$', nullable: true },
    per_page: { type: 'string', pattern: '^\\d+$', nullable: true },
    template_src: { type: 'string', enum: ['ezCater'], nullable: true },
    template_target: {
      type: 'string',
      enum: ['ezCater', 'Nutshell'],
      nullable: true,
    },
  },
  additionalProperties: false,
};

export const validateGetSystemIntegrationsListQuery =
  ajvSingleton.compile(querySchema);
