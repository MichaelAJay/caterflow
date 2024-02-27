import { validateCreateAccountRequestBody } from './post.account';

jest.mock('../../../system/singletons/ajv.singleton', () => ({
  compile: jest
    .fn()
    .mockImplementation(
      (schema) => (data: any) =>
        schema.properties.name.type === typeof data.name,
    ),
}));

import ajvSingleton from '../../../system/singletons/ajv.singleton';

describe('validateCreateAccountRequestBody', () => {
  it('should return true if the data is valid', () => {
    const data = { name: 'test' };
    const result = validateCreateAccountRequestBody(data);
    expect(result).toBe(true);
  });

  it('should return false if the data is not valid', () => {
    const data = { status: 'pending' };
    const result = validateCreateAccountRequestBody(data);
    expect(result).toBe(false);
  });
});
