import { JSONSchemaType } from 'ajv';
import ajvSingleton from '../../../system/singletons/ajv.singleton';

type CreateAccount = {
  name: string;
};

const schema: JSONSchemaType<CreateAccount> = {
  type: 'object',
  properties: {
    name: { type: 'string' },
  },
  required: ['name'],
  additionalProperties: false,
};

const validate = ajvSingleton.compile(schema);

export function validateCreateAccountRequestBody(
  data: any,
): data is CreateAccount {
  return validate(data);
}
