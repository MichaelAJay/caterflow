import { CreateIntegrationAssetRequestBody } from '../interfaces/request/body/post.create-integration-asset.body.type';
import { validateCreateCateringCompanyRequestBody } from './post.caterer';
import { validateCreateIntegrationAssetBody } from './post.create-integration-asset';

describe('catering company validator integration tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('post.caterer schema', () => {
    it('should validate successfully when name is provided and is a string', () => {
      const data = { name: 'test' };
      const result = validateCreateCateringCompanyRequestBody(data);
      expect(result).toEqual({ valid: true, data });
    });

    it('should fail validation when name is not provided', () => {
      const data = {};
      const result = validateCreateCateringCompanyRequestBody(data) as {
        valid: false;
        errors: Array<{ path: string; message: string | undefined }>;
      };
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual([
        { path: '', message: "must have required property 'name'" },
      ]);
    });

    it('should fail validation when name is not a string', () => {
      const data = { name: 123 };
      const result = validateCreateCateringCompanyRequestBody(data) as {
        valid: false;
        errors: Array<{ path: string; message: string | undefined }>;
      };
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual([
        { path: '/name', message: 'must be string' },
      ]);
    });

    it('should fail validation when additional properties are provided', () => {
      const data = { name: 'test', extra: 'property' };
      const result = validateCreateCateringCompanyRequestBody(data) as {
        valid: false;
        errors: Array<{ path: string; message: string | undefined }>;
      };
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual([
        { path: '', message: 'must NOT have additional properties' },
      ]);
    });
  });

  describe('validateCreateIntegrationAssetBody', () => {
    it('should return true when isSecret is true and value is a string', () => {
      const body: CreateIntegrationAssetRequestBody = {
        isSecret: true,
        value: 'secret',
      };
      expect(validateCreateIntegrationAssetBody(body)).toBe(true);
    });

    it('should return false when isSecret is true but value is not a string', () => {
      const body = {
        isSecret: true,
        value: 123,
      };
      expect(validateCreateIntegrationAssetBody(body)).toBe(false);
    });

    it('should return true when isSecret is false and value is not included', () => {
      const body: CreateIntegrationAssetRequestBody = {
        isSecret: false,
      };
      expect(validateCreateIntegrationAssetBody(body)).toBe(true);
    });

    it('should return true when isSecret is false and value is an object', () => {
      const body: CreateIntegrationAssetRequestBody = {
        isSecret: false,
        value: {},
      };
      expect(validateCreateIntegrationAssetBody(body)).toBe(true);
    });

    it('should return false when isSecret is not a boolean', () => {
      const body = {
        isSecret: 'true',
      };
      expect(validateCreateIntegrationAssetBody(body)).toBe(false);
    });

    it('should return false when isSecret is not present', () => {
      const body = {
        value: 'secret',
      };
      expect(validateCreateIntegrationAssetBody(body)).toBe(false);
    });
  });
});
