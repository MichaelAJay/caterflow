import { JSONSchemaType } from 'ajv';
import {
  ExternalSystemWithTypedRequirements,
  ExternalSystemWithTypedRequirementsAndIntegrations,
} from '../types/return/external-system.type';
import ajvSingleton from 'src/system/singletons/ajv.singleton';
import { $Enums } from '@prisma/client';
import { Requirement } from '../types/external_systems_requirements';

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

const externalSystemSchema: JSONSchemaType<ExternalSystemWithTypedRequirements> =
  {
    type: 'object',
    properties: {
      id: { type: 'number' },
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
    },
    required: ['id', 'name', 'uiName', 'uiDescription', 'requirements'],
    additionalProperties: false,
  };

const fullExternalSystemSchema: JSONSchemaType<ExternalSystemWithTypedRequirementsAndIntegrations> =
  {
    type: 'object',
    properties: {
      id: { type: 'number' },
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
  };

const externalSystemsSchema: JSONSchemaType<
  ExternalSystemWithTypedRequirementsAndIntegrations[]
> = {
  type: 'array',
  items: fullExternalSystemSchema,
};

export const validateExternalSystem =
  ajvSingleton.compile(externalSystemSchema);

export const validateFullExternalSystem = ajvSingleton.compile(
  fullExternalSystemSchema,
);

export const validateExternalSystems = ajvSingleton.compile(
  externalSystemsSchema,
);
