import { EzCaterAddress } from '../ezcater-address.type';

export type CatererResponse = {
  live: boolean;
  name: string;
  storeNumber: string;
  uuid: string;
  address: EzCaterAddress;
};
