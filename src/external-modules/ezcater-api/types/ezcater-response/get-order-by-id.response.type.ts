import { EzCaterAddress } from '../ezcater-address.type';
import { CatererResponse } from './caterer.response.type';

export type GetOrderByIdResponse = {
  data: GetOrderByIdResponseData;
};

export type GetOrderByIdResponseData = {
  order: {
    deliverId: string | null;
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
};

export type CatererCartResponse = {
  feesAndDiscounts: unknown[]; // @TODO fix
  orderItems: EzCaterOrderItem[];
};

export type EzCaterOrderItem = {
  quantity: number; // counting number
  name: string;
  totalInSubunits: {
    subunits: number; // Smallest monetary unit (e.g. U.S. cent)
  };
  customizations: unknown[];
  tableware: {
    specialInstructions: unknown | null;
    tablewareChoices: EzCaterTablewareChoice[];
  };
  totals: {
    catererTotalDue: number; // float
  };
};

export type EzCaterTablewareChoice = unknown;

export type OrderEventResponse = {
  address: any; // @TODO FIX
  catererHandoffFoodTime: string; // ISO 8601 ex: "2024-04-23T15:30:00Z"
  contact: {
    name: string | null;
    phone: string | null;
  };
  customerProvidedName: string | null;
  headcount: any | null; // Guessing number - need to confirm
  orderType: string; // Can probably create string literal. 'TAKEOUT' is one option
  thirdPartyDeliveryPartner: unknown;
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
