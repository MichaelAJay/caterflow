import { validateCreateAccountRequestBody } from './post.account';

describe('account validator integration tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('post.account schema', () => {
    it('should validate successfully when name is provided and is a string', () => {
      const data = { name: 'test' };
      const result = validateCreateAccountRequestBody(data);
      expect(result).toEqual({ valid: true, data });
    });

    it('should fail validation when name is not provided', () => {
      const data = {};
      const result = validateCreateAccountRequestBody(data) as {
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
      const result = validateCreateAccountRequestBody(data) as {
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
      const result = validateCreateAccountRequestBody(data) as {
        valid: false;
        errors: Array<{ path: string; message: string | undefined }>;
      };
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual([
        { path: '', message: 'must NOT have additional properties' },
      ]);
    });
  });
});
