import { JSONSchemaType } from 'ajv';
import {
  ExternalSystemWithTypedRequirements,
  ExternalSystemWithTypedRequirementsAndIntegrations,
} from '../types/return/external-system.type';
import ajvSingleton from '../../../../../system/singletons/ajv.singleton';
import { $Enums } from '@prisma/client';
import {
  ExternalSystemRequirements,
  Requirement,
} from '../types/external_systems_requirements';

const requirementSchema: JSONSchemaType<Requirement> = {
  type: 'object',
  nullable: true,
  properties: {
    direction: { type: 'string', enum: ['OUT', 'IN'] },
    isSecret: { type: 'boolean', const: true },
    uiName: { type: 'string' },
    uiDescription: { type: 'string' },
  },
  required: ['direction', 'isSecret', 'uiName', 'uiDescription'],
  additionalProperties: false,
};

const externalSystemRequirementsSchema: JSONSchemaType<ExternalSystemRequirements> =
  {
    type: 'object',
    properties: {
      API_KEY: { ...requirementSchema, nullable: true },
      API_USERNAME: { ...requirementSchema, nullable: true },
      WEBHOOK_SECRET: { ...requirementSchema, nullable: true },
    },
    additionalProperties: false,
  };

const externalSystemSchema: JSONSchemaType<ExternalSystemWithTypedRequirements> =
  {
    type: 'object',
    properties: {
      name: { type: 'string' },
      uiName: { type: 'string' },
      uiDescription: { type: 'string' },
      requirements: externalSystemRequirementsSchema,
    },
    required: ['name', 'uiName', 'uiDescription', 'requirements'],
    additionalProperties: false,
  };

const fullExternalSystemSchema: JSONSchemaType<ExternalSystemWithTypedRequirementsAndIntegrations> =
  {
    type: 'object',
    properties: {
      name: { type: 'string' },
      uiName: { type: 'string' },
      uiDescription: { type: 'string' },
      requirements: {
        type: 'object',
        properties: {
          API_KEY: { ...requirementSchema, nullable: true },
          API_USERNAME: { ...requirementSchema, nullable: true },
          WEBHOOK_SECRET: { ...requirementSchema, nullable: true },
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
            srcSystemName: {
              type: 'string',
              enum: Object.values($Enums.ExternalSystemName),
            },
            srcEntity: {
              type: 'string',
              enum: Object.values($Enums.ExternalEntity),
            }, // $Enums.ExternalEntity
            targetSystemName: {
              type: 'string',
              enum: Object.values($Enums.ExternalSystemName),
            },
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
            'srcSystemName',
            'srcEntity',
            'targetSystemName',
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
            srcSystemName: {
              type: 'string',
              enum: Object.values($Enums.ExternalSystemName),
            },
            srcEntity: {
              type: 'string',
              enum: Object.values($Enums.ExternalEntity),
            }, // $Enums.ExternalEntity
            targetSystemName: {
              type: 'string',
              enum: Object.values($Enums.ExternalSystemName),
            },
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
            'srcSystemName',
            'srcEntity',
            'targetSystemName',
            'targetEntity',
          ],
          additionalProperties: false,
        },
      },
    },
    required: [
      'name',
      'uiName',
      'uiDescription',
      'requirements',
      'srcFor',
      'targetFor',
    ],
    additionalProperties: false,
  };

const externalSystemsSchema: JSONSchemaType<
  ExternalSystemWithTypedRequirementsAndIntegrations[]
> = {
  type: 'array',
  items: fullExternalSystemSchema,
};

export const validateExternalSystemRequirements = ajvSingleton.compile(
  externalSystemRequirementsSchema,
);

export const validateExternalSystem =
  ajvSingleton.compile(externalSystemSchema);

export const validateFullExternalSystem = ajvSingleton.compile(
  fullExternalSystemSchema,
);

export const validateExternalSystems = ajvSingleton.compile(
  externalSystemsSchema,
);
