/**
 * This file is an attempt to think through how ExternalSystems and their requirements could be rethought
 * Perhaps using JSON fields instead of separate tables & associated records.
 */

export type ExternalSystemRequirement = {
  direction: 'IN' | 'OUT';
  isSecret: boolean;
  type: 'API_KEY' | 'API_USERNAME' | 'WEBHOOK_SECRET';
  uiName: string;
  uiDescription: string;
};

export type CompanyExternalSystemConnectionRequirement =
  ExternalSystemRequirement & {
    status: 'UNCONFIGURED' | 'UNTESTED' | 'TEST_FAILED' | 'TEST_SUCCEEDED';
    value?: Record<string, any>;
  };
