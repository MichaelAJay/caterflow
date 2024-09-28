import { CompanyExternalSystemConnection } from '@prisma/client';
import {
  ExternalSystemRequirements,
  Requirement,
  RequirementType,
} from './external_systems_requirements';

export const AssetStatus = {
  Unconfigured: 'UNCONFIGURED',
  Untested: 'UNTESTED',
  Test_Failed: 'TEST_FAILED',
  Test_Succeeded: 'TEST_SUCCEEDED',
} as const;

export type AssetStatusValues = (typeof AssetStatus)[keyof typeof AssetStatus];

export type Asset = Requirement & {
  status: AssetStatusValues;
  value?: any;
};

export type CompanyConnectionAsset = Partial<Record<RequirementType, Asset>>;
export type CompanyConnectionWithTypedAssets = Omit<
  CompanyExternalSystemConnection,
  'assets'
> & {
  assets: CompanyConnectionAsset;
};

// These are just examples
export const ezCaterRequirements: ExternalSystemRequirements = {
  API_KEY: {
    direction: 'OUT',
    isSecret: true,
    uiName: 'API Key',
    uiDescription: 'An api key',
  },
  WEBHOOK_SECRET: {
    direction: 'IN',
    isSecret: true,
    uiName: 'Webhook Secret',
    uiDescription: 'Use to validate incoming order',
  },
};

export const nutshellRequirements: ExternalSystemRequirements = {
  API_KEY: {
    direction: 'OUT',
    isSecret: true,
    uiName: 'API key',
    uiDescription: 'An api key',
  },
  API_USERNAME: {
    direction: 'OUT',
    isSecret: true,
    uiName: 'API Username',
    uiDescription: 'Username (email) to use to make request',
  },
};
