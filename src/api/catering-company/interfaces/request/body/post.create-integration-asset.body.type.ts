export type CreateSecretIntegrationAssetRequestBody = {
  isSecret: true;
  value: string;
};

export type CreateNonSecretIntegrationAssetRequestBody = {
  isSecret: false;
  value?: any;
};

type CreateIntegrationAssetRequestBodyUnion =
  | CreateSecretIntegrationAssetRequestBody
  | CreateNonSecretIntegrationAssetRequestBody;

export type CreateIntegrationAssetRequestBody =
  CreateIntegrationAssetRequestBodyUnion & {
    menuId?: number;
  };
