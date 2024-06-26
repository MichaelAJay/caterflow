/**
 * When new requirement types are added, add them to the array only
 */
export const requirementTypes = [
  'API_KEY',
  'API_USERNAME',
  'WEBHOOK_SECRET',
] as const;
export type RequirementType = (typeof requirementTypes)[number];
export const isRequirementType = (input: any): input is RequirementType => {
  return requirementTypes.includes(input);
};

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

export const validateRequirementType = (
  requirementType: any,
): requirementType is RequirementType => {
  return requirementTypes.includes(requirementType);
};
