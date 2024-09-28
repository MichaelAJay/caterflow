import { JSONSchemaType } from 'ajv';
import { AllSubscribersResponse } from '../types/ezcater-response/all-subscribers.response.type';
import ajvSingleton from '../../../system/singletons/ajv.singleton';

const allSubscribersResponseSchema: JSONSchemaType<AllSubscribersResponse> = {
  type: 'object',
  properties: {
    data: {
      type: 'object',
      properties: {
        subscribers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              subscriptions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    eventEntity: { type: 'string', const: 'Order' },
                    eventKey: {
                      type: 'string',
                      enum: ['accepted', 'cancelled'],
                    },
                    parentEntity: { type: 'string', const: 'Caterer' },
                    parentId: { type: 'string' },
                    subscriberId: { type: 'string' },
                  },
                  required: [
                    'eventEntity',
                    'eventKey',
                    'parentEntity',
                    'parentId',
                    'subscriberId',
                  ],
                  additionalProperties: false,
                },
              },
            },
            required: ['id', 'name', 'subscriptions'],
            additionalProperties: false,
          },
        },
      },
      required: ['subscribers'],
      additionalProperties: false,
    },
  },
  required: ['data'],
  additionalProperties: false,
};

export const validateAllSubscribersQuery = ajvSingleton.compile(
  allSubscribersResponseSchema,
);
