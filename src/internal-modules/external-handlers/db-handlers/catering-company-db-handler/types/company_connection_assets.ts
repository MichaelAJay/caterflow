import {
  ExternalSystemRequirements,
  Requirement,
  RequirementType,
} from './external_systems_requirements';

type Asset = Requirement & {
  status: 'UNCONFIGURED' | 'UNTESTED' | 'TEST_FAILED' | 'TEST_SUCCEEDED';
  value?: any;
};

export type CompanyConnectionAsset = Partial<Record<RequirementType, Asset>>;

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

export const nutshellRequiremnts: ExternalSystemRequirements = {
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
