import { JSONSchemaType } from 'ajv';
import { AllCaterersResponseData } from '../types/ezcater-response/all-caterers.response.type';
import ajvSingleton from '../../../system/singletons/ajv.singleton';

const schema: JSONSchemaType<AllCaterersResponseData> = {
  type: 'object',
  properties: {
    caterers: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          live: { type: 'boolean' },
          name: { type: 'string' },
          storeNumber: { type: 'string' },
          uuid: { type: 'string' },
          address: {
            type: 'object',
            properties: {
              city: { type: 'string' },
              deliveryInstructions: { type: 'string', nullable: true },
              name: { type: 'string' },
              state: { type: 'string' },
              stateName: { type: 'string' },
              street: { type: 'string', nullable: true },
              street2: { type: 'string', nullable: true },
              street3: { type: 'string', nullable: true },
              zip: { type: 'string' },
            },
            required: ['city', 'name', 'state', 'stateName', 'zip'],
            additionalProperties: false,
          },
        },
        required: ['live', 'name', 'storeNumber', 'uuid', 'address'],
        additionalProperties: false,
      },
    },
  },
  required: ['caterers'],
  additionalProperties: false,
};

export const validateAllCaterersQuery = ajvSingleton.compile(schema);
