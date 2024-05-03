import { CatererResponse } from './caterer.response.type';

export type AllCaterersResponse = {
  data: AllCaterersResponseData;
};

export type AllCaterersResponseData = {
  caterers: CatererResponse[];
};
