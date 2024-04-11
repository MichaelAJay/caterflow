import { CreateIntegrationAssetRequestBody } from '../interfaces/request/body/post.create-integration-asset.body.type';

export function validateCreateIntegrationAssetBody(
  body: any,
): body is CreateIntegrationAssetRequestBody {
  if ('isSecret' in body && typeof body.isSecret === 'boolean') {
    if (body.isSecret === true) {
      return 'value' in body && typeof body.value === 'string';
    }
    return true;
  }
  return false;
}
