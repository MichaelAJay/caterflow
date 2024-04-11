export type CreateSecretIntegrationAssetRequestBody = {
  isSecret: true;
  value: string;
};

export type CreateNonSecretIntegrationAssetRequestBody = {
  isSecret: false;
  value?: any;
};

export type CreateIntegrationAssetRequestBody =
  | CreateSecretIntegrationAssetRequestBody
  | CreateNonSecretIntegrationAssetRequestBody;
