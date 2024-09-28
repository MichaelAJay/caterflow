import { JSONSchemaType } from 'ajv';
import { ExternalSystemRequirements } from '../types/external_systems_requirements';
import ajvSingleton from '../../../../../system/singletons/ajv.singleton';

/**
 * All properties are optional, but if included, must match the specified schema
 */
export const externalSystemRequirementsSchema: JSONSchemaType<ExternalSystemRequirements> =
  {
    type: 'object',
    properties: {
      API_KEY: {
        type: 'object',
        nullable: true,
        properties: {
          direction: { type: 'string', const: 'OUT' },
          isSecret: { type: 'boolean', const: true },
          uiName: { type: 'string' },
          uiDescription: { type: 'string' },
        },
        required: ['direction', 'isSecret', 'uiName', 'uiDescription'],
        additionalProperties: false,
      },
      API_USERNAME: {
        type: 'object',
        nullable: true,
        properties: {
          direction: { type: 'string', const: 'OUT' },
          isSecret: { type: 'boolean', const: true },
          uiName: { type: 'string' },
          uiDescription: { type: 'string' },
        },
        required: ['direction', 'isSecret', 'uiName', 'uiDescription'],
        additionalProperties: false,
      },
      WEBHOOK_SECRET: {
        type: 'object',
        nullable: true,
        properties: {
          direction: { type: 'string', const: 'IN' },
          isSecret: { type: 'boolean', const: true },
          uiName: { type: 'string' },
          uiDescription: { type: 'string' },
        },
        required: ['direction', 'isSecret', 'uiName', 'uiDescription'],
        additionalProperties: false,
      },
    },
    additionalProperties: false,
  };

export const validateExternalSystemRequirements = ajvSingleton.compile(
  externalSystemRequirementsSchema,
);
