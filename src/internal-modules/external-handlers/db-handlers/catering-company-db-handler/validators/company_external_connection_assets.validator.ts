import { JSONSchemaType } from 'ajv';
import {
  CompanyConnectionAsset,
  assetStatus,
} from '../types/company_connection_assets';
import ajvSingleton from 'src/system/singletons/ajv.singleton';

const companyExternalConnectionAssetsSchema: JSONSchemaType<CompanyConnectionAsset> =
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
          status: { type: 'string', enum: Object.values(assetStatus) },
          value: {
            oneOf: [
              { type: 'null' },
              { type: 'boolean' },
              { type: 'object' },
              { type: 'number' },
              { type: 'string' },
            ],
          } as any,
        },
        required: [
          'direction',
          'isSecret',
          'uiName',
          'uiDescription',
          'status',
        ],
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
          status: { type: 'string', enum: Object.values(assetStatus) },
          value: {
            oneOf: [
              { type: 'null' },
              { type: 'boolean' },
              { type: 'object' },
              { type: 'number' },
              { type: 'string' },
            ],
          } as any,
        },
        required: [
          'direction',
          'isSecret',
          'uiName',
          'uiDescription',
          'status',
        ],
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
          status: { type: 'string', enum: Object.values(assetStatus) },
          value: {
            oneOf: [
              { type: 'null' },
              { type: 'boolean' },
              { type: 'object' },
              { type: 'number' },
              { type: 'string' },
            ],
          } as any,
        },
        required: [
          'direction',
          'isSecret',
          'uiName',
          'uiDescription',
          'status',
        ],
        additionalProperties: false,
      },
    },
    additionalProperties: false,
  };

export const validateCompanyExternalSystemConnectionAssets =
  ajvSingleton.compile(companyExternalConnectionAssetsSchema);
