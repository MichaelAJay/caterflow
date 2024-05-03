import { EzCaterAddress } from '../ezcater-address.type';
import { CatererResponse } from './caterer.response.type';

export type GetOrderByIdResponse = {
  data: GetOrderByIdResponseData;
};

export type GetOrderByIdResponseData = {
  order: EzCaterCompleteOrder;
};

export type EzCaterCompleteOrder = {
  deliveryId?: string | null;
  uuid: string;
  caterer: CatererResponse;
  catererCart: CatererCartResponse;
  event: OrderEventResponse;
  isTaxExempt: boolean;
  lifecycle: {
    orderisCurrently: string; // THIS NEEDS EXPLORING
  };
  orderCustomer: {
    firstName: string;
    fullName: string;
    lastName: string;
  };
  orderNumber: string;
  orderSourceType: string; // should be able to determine all allowed values
  taxableAddress: EzCaterAddress;
  totals: EzCaterOrderTotals;
};

export type CatererCartResponse = {
  feesAndDiscounts: {
    name: string;
    cost: EzCaterMoneyResponse;
  }[];
  orderItems: EzCaterOrderItem[];
};

export type EzCaterOrderItem = {
  quantity: number; // counting number
  name: string;
  totalInSubunits: {
    subunits: number; // Smallest monetary unit (e.g. U.S. cent)
  };
  customizations: OrderItemCustomization[];
  tableware: {
    specialInstructions?: string | null;
    tablewareChoices: EzCaterTablewareChoice[];
  };
  totals: {
    catererTotalDue: number; // float
  };
};

export type OrderItemCustomization = {
  customizationTypeName: string;
  name: string;
  quantity: number;
};

export type EzCaterTablewareChoice = {
  choiceUuid: string;
  isIncluded: boolean;
  itemCount: number;
  name: string;
};

export type OrderEventResponse = {
  address: EzCaterAddress; // @TODO FIX
  catererHandoffFoodTime: string; // ISO 8601 ex: "2024-04-23T15:30:00Z"
  contact: {
    name?: string | null;
    phone?: string | null;
  };
  customerProvidedName?: string | null;
  headcount?: number | null; // Guessing number - need to confirm
  orderType: string; // Can probably create string literal. 'TAKEOUT' is one option
  thirdPartyDeliveryPartner?: string | null;
  timeZoneIdentifier: string; // Can probably get enumed list e.g. "America/New_York"
  timeZoneOffset: string; // e.g. "-04:00"
  timestamp: string; // ISO 8601 ex: "2024-04-23T15:30:00Z"
};

export type EzCaterMoneyResponse = {
  currency: string;
  subunits: number;
  subunitsV2: string; // String version of subunits
};

export type EzCaterOrderTotals = {
  customerTotalDue: EzCaterMoneyResponse;
  pointOfSaleIntegrationFee: EzCaterMoneyResponse;
  salesTax: EzCaterMoneyResponse;
  salesTaxRemittance: EzCaterMoneyResponse;
  subTotal: EzCaterMoneyResponse;
  tip: EzCaterMoneyResponse;
};
