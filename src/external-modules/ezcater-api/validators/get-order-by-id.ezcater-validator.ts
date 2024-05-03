import { JSONSchemaType } from 'ajv';
import { CatererResponse } from '../types/ezcater-response/caterer.response.type';
import {
  CatererCartResponse,
  EzCaterMoneyResponse,
  EzCaterOrderItem,
  EzCaterOrderTotals,
  GetOrderByIdResponse,
  GetOrderByIdResponseData,
  OrderEventResponse,
  OrderItemCustomization,
} from '../types/ezcater-response/get-order-by-id.response.type';
import { EzCaterAddress } from '../types/ezcater-address.type';
import ajvSingleton from 'src/system/singletons/ajv.singleton';

const EzCaterAddressSchema: JSONSchemaType<EzCaterAddress> = {
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
};

const CatererResponseSchema: JSONSchemaType<CatererResponse> = {
  type: 'object',
  properties: {
    live: { type: 'boolean' },
    name: { type: 'string' },
    storeNumber: { type: 'string' },
    uuid: { type: 'string' },
    address: EzCaterAddressSchema,
  },
  required: ['live', 'name', 'storeNumber', 'uuid', 'address'],
  additionalProperties: false,
};

const OrderItemCustomizationSchema: JSONSchemaType<OrderItemCustomization> = {
  type: 'object',
  properties: {
    customizationTypeName: { type: 'string' },
    name: { type: 'string' },
    quantity: { type: 'number' },
  },
  required: ['customizationTypeName', 'name', 'quantity'],
};

const EzCaterOrderItemSchema: JSONSchemaType<EzCaterOrderItem> = {
  type: 'object',
  properties: {
    quantity: { type: 'number' },
    name: { type: 'string' },
    totalInSubunits: {
      type: 'object',
      properties: {
        subunits: { type: 'number' },
      },
      required: ['subunits'],
      additionalProperties: false,
    },
    customizations: {
      type: 'array',
      items: OrderItemCustomizationSchema,
    },
    tableware: {
      type: 'object',
      properties: {
        specialInstructions: { type: 'string', nullable: true },
        tablewareChoices: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              choiceUuid: { type: 'string' },
              isIncluded: { type: 'boolean' },
              itemCount: { type: 'number' },
              name: { type: 'string' },
            },
            required: ['choiceUuid', 'isIncluded', 'itemCount', 'name'],
          },
        },
      },
      required: ['tablewareChoices'],
      additionalProperties: false,
    },
    totals: {
      type: 'object',
      properties: {
        catererTotalDue: { type: 'number' },
      },
      required: ['catererTotalDue'],
      additionalProperties: false,
    },
  },
  required: [
    'quantity',
    'name',
    'totalInSubunits',
    'customizations',
    'tableware',
    'totals',
  ],
  additionalProperties: false,
};

const EzCaterMoneyResponseSchema: JSONSchemaType<EzCaterMoneyResponse> = {
  type: 'object',
  properties: {
    currency: { type: 'string' },
    subunits: { type: 'number' },
    subunitsV2: { type: 'string' },
  },
  required: ['currency', 'subunits', 'subunitsV2'],
  additionalProperties: false,
};

const CatererCartResponseSchema: JSONSchemaType<CatererCartResponse> = {
  type: 'object',
  properties: {
    feesAndDiscounts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          cost: EzCaterMoneyResponseSchema,
        },
        required: ['name', 'cost'],
      },
    },
    orderItems: { type: 'array', items: EzCaterOrderItemSchema },
  },
  required: ['feesAndDiscounts', 'orderItems'],
  additionalProperties: false,
};

const OrderEventResponseSchema: JSONSchemaType<OrderEventResponse> = {
  type: 'object',
  properties: {
    address: EzCaterAddressSchema,
    catererHandoffFoodTime: { type: 'string' },
    contact: {
      type: 'object',
      properties: {
        name: { type: 'string', nullable: true },
        phone: { type: 'string', nullable: true },
      },
      additionalProperties: false,
    },
    customerProvidedName: { type: 'string', nullable: true },
    headcount: { type: 'number', nullable: true },
    orderType: { type: 'string' },
    thirdPartyDeliveryPartner: { type: 'string', nullable: true },
    timeZoneIdentifier: { type: 'string' },
    timeZoneOffset: { type: 'string' },
    timestamp: { type: 'string' },
  },
  required: [
    'address',
    'catererHandoffFoodTime',
    'contact',
    'orderType',
    'timeZoneIdentifier',
    'timeZoneOffset',
    'timestamp',
  ],
  additionalProperties: false,
};

const EzCaterOrderTotalsSchema: JSONSchemaType<EzCaterOrderTotals> = {
  type: 'object',
  properties: {
    customerTotalDue: EzCaterMoneyResponseSchema,
    pointOfSaleIntegrationFee: EzCaterMoneyResponseSchema,
    salesTax: EzCaterMoneyResponseSchema,
    salesTaxRemittance: EzCaterMoneyResponseSchema,
    subTotal: EzCaterMoneyResponseSchema,
    tip: EzCaterMoneyResponseSchema,
  },
  required: [
    'customerTotalDue',
    'pointOfSaleIntegrationFee',
    'salesTax',
    'salesTaxRemittance',
    'subTotal',
    'tip',
  ],
  additionalProperties: false,
};

const GetOrderByIdResponseDataSchema: JSONSchemaType<GetOrderByIdResponseData> =
  {
    type: 'object',
    properties: {
      order: {
        type: 'object',
        properties: {
          deliveryId: { type: 'string', nullable: true },
          uuid: { type: 'string' },
          caterer: CatererResponseSchema,
          catererCart: CatererCartResponseSchema,
          event: OrderEventResponseSchema,
          isTaxExempt: { type: 'boolean' },
          lifecycle: {
            type: 'object',
            properties: {
              orderisCurrently: { type: 'string' },
            },
            required: ['orderisCurrently'],
            additionalProperties: false,
          },
          orderCustomer: {
            type: 'object',
            properties: {
              firstName: { type: 'string' },
              fullName: { type: 'string' },
              lastName: { type: 'string' },
            },
            required: ['firstName', 'fullName', 'lastName'],
            additionalProperties: false,
          },
          orderNumber: { type: 'string' },
          orderSourceType: { type: 'string' },
          taxableAddress: EzCaterAddressSchema,
          totals: EzCaterOrderTotalsSchema,
        },
        required: [
          'uuid',
          'caterer',
          'catererCart',
          'event',
          'isTaxExempt',
          'lifecycle',
          'orderCustomer',
          'orderNumber',
          'orderSourceType',
          'taxableAddress',
          'totals',
        ],
        additionalProperties: false,
      },
    },
    required: ['order'],
    additionalProperties: false,
  };

const GetOrderByIdResponseSchema: JSONSchemaType<GetOrderByIdResponse> = {
  type: 'object',
  properties: {
    data: GetOrderByIdResponseDataSchema,
  },
  required: ['data'],
  additionalProperties: false,
};

export const validateGetOrderByIdQuery = ajvSingleton.compile(
  GetOrderByIdResponseSchema,
);
