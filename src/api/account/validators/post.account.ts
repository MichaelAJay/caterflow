import { JSONSchemaType } from 'ajv';
import ajvSingleton from '../../../system/singletons/ajv.singleton';

type CreateAccount = {
  name: string;
};

export const schema: JSONSchemaType<CreateAccount> = {
  type: 'object',
  properties: {
    name: { type: 'string' },
  },
  required: ['name'],
  additionalProperties: false,
};

const validate = ajvSingleton.compile(schema);

type ValidationResult =
  | { valid: true; data: CreateAccount }
  | { valid: false; errors: any };
export function validateCreateAccountRequestBody(data: any): ValidationResult {
  const valid = validate(data);
  if (!valid) {
    return { valid, errors: validate.errors };
  }
  return { valid, data };
}
