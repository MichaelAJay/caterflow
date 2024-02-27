import { schema as createAccountSchema } from './post.account';
import ajvSingleton from '../../../system/singletons/ajv.singleton';
import { ValidateFunction } from 'ajv';

describe('account validator unit tests', () => {
  describe('post.account schema', () => {
    let validate: ValidateFunction<any>;

    beforeAll(() => {
      validate = ajvSingleton.compile(createAccountSchema);
    });

    it('should validate successfully when name is provided and is a string', () => {
      const data = { name: 'test' };
      const valid = validate(data);
      expect(valid).toBe(true);
    });

    it('should fail validation when name is not provided', () => {
      const data = {};
      const valid = validate(data);
      expect(valid).toBe(false);
    });

    it('should fail validation when name is not a string', () => {
      const data = { name: 123 };
      const valid = validate(data);
      expect(valid).toBe(false);
    });

    it('should fail validation when additional properties are provided', () => {
      const data = { name: 'test', extra: 'property' };
      const valid = validate(data);
      expect(valid).toBe(false);
    });
  });
});
