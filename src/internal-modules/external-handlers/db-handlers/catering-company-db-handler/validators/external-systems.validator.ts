import { JSONSchemaType } from 'ajv';
import { ExternalSystemWithTypedRequirementsAndIntegrations } from '../types/return/external-system.type';
import ajvSingleton from 'src/system/singletons/ajv.singleton';
import { $Enums } from '@prisma/client';

const externalSystemsSchema: JSONSchemaType<
  ExternalSystemWithTypedRequirementsAndIntegrations[]
> = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      id: { type: 'number' },
      name: { type: 'string' },
      uiName: { type: 'string' },
      uiDescription: { type: 'string' },
      requirements: {
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
      },
      srcFor: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            uiName: { type: 'string' },
            uiDescription: { type: 'string' },
            event: {
              type: 'string',
              enum: Object.values($Enums.IntegrationEvent),
            }, // $Enums.IntegrationEvent
            srcSystemId: { type: 'number' },
            srcEntity: {
              type: 'string',
              enum: Object.values($Enums.ExternalEntity),
            }, // $Enums.ExternalEntity
            targetSystemId: { type: 'number' },
            targetEntity: {
              type: 'string',
              enum: Object.values($Enums.ExternalEntity),
            }, // $Enums.ExternalEntity
          },
          required: [
            'id',
            'uiName',
            'uiDescription',
            'event',
            'srcSystemId',
            'srcEntity',
            'targetSystemId',
            'targetEntity',
          ],
          additionalProperties: false,
        },
      },
      targetFor: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            uiName: { type: 'string' },
            uiDescription: { type: 'string' },
            event: {
              type: 'string',
              enum: Object.values($Enums.IntegrationEvent),
            }, // $Enums.IntegrationEvent
            srcSystemId: { type: 'number' },
            srcEntity: {
              type: 'string',
              enum: Object.values($Enums.ExternalEntity),
            }, // $Enums.ExternalEntity
            targetSystemId: { type: 'number' },
            targetEntity: {
              type: 'string',
              enum: Object.values($Enums.ExternalEntity),
            }, // $Enums.ExternalEntity
          },
          required: [
            'id',
            'uiName',
            'uiDescription',
            'event',
            'srcSystemId',
            'srcEntity',
            'targetSystemId',
            'targetEntity',
          ],
          additionalProperties: false,
        },
      },
    },
    required: [
      'id',
      'name',
      'uiName',
      'uiDescription',
      'requirements',
      'srcFor',
      'targetFor',
    ],
    additionalProperties: false,
  },
};

export const validateExternalSystems = ajvSingleton.compile(
  externalSystemsSchema,
);
