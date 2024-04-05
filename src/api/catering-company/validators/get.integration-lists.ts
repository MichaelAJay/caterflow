import { JSONSchemaType } from 'ajv';
import ajvSingleton from '../../../system/singletons/ajv.singleton';

export type IGetCompanyIntegrationsQueryRequest = {
  pg?: string; // must be parseable to int
  per_page?: string; // must be parseable to int
  filter_configured?: string; // 'true' | 'false'
  filter_active?: string; // 'true' | 'false'
  created_since?: 'last_week' | 'last_month' | 'last_year';
  template_src?: 'ezCater';
  template_target?: 'ezCater' | 'Nutshell';
  sort?: 'created_asc' | 'created_desc';
};

export const querySchema: JSONSchemaType<IGetCompanyIntegrationsQueryRequest> =
  {
    type: 'object',
    properties: {
      pg: { type: 'string', pattern: '^\\d+$', nullable: true },
      per_page: { type: 'string', pattern: '^\\d+$', nullable: true },
      filter_configured: {
        type: 'string',
        enum: ['true', 'false'],
        nullable: true,
      },
      filter_active: {
        type: 'string',
        enum: ['true', 'false'],
        nullable: true,
      },
      created_since: {
        type: 'string',
        enum: ['last_week', 'last_month', 'last_year'],
        nullable: true,
      },
      template_src: { type: 'string', enum: ['ezCater'], nullable: true },
      template_target: {
        type: 'string',
        enum: ['ezCater', 'Nutshell'],
        nullable: true,
      },
      sort: {
        type: 'string',
        enum: ['created_asc', 'created_desc'],
        nullable: true,
      },
    },
    additionalProperties: false,
  };

export const validateGetIntegrationsListQuery =
  ajvSingleton.compile(querySchema);
