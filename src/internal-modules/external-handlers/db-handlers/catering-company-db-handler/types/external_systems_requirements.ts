export type RequirementType = 'API_KEY' | 'API_USERNAME' | 'WEBHOOK_SECRET';

export type Requirement = {
  direction: 'IN' | 'OUT';
  isSecret: boolean;
  uiName: string;
  uiDescription: string;
};

export type ExternalSystemRequirements = Partial<
  Record<RequirementType, Requirement>
>;

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
