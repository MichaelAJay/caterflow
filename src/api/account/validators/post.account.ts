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
  | {
      valid: false;
      errors: Array<{ path: string; message: string | undefined }>;
    };
export function validateCreateAccountRequestBody(data: any): ValidationResult {
  const valid = validate(data);
  if (!valid) {
    const errorMsgs = validate.errors
      ? validate.errors.map((err) => ({
          path: err.instancePath,
          message: err.message,
        }))
      : [];
    return { valid, errors: errorMsgs };
  }
  return { valid, data };
}
