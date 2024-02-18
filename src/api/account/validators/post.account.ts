import { JSONSchemaType } from 'ajv';
import ajvSingleton from 'src/system/singletons/ajv.singleton';

type CreateAccount = {
  name: string;
  owner: string;
  email: string;
  password: string;
};

const schema: JSONSchemaType<CreateAccount> = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    owner: { type: 'string' },
    email: { type: 'string', format: 'email' },
    password: { type: 'string' },
  },
  required: ['name', 'owner', 'email', 'password'],
  additionalProperties: false,
};

const validate = ajvSingleton.compile(schema);

export function validateCreateAccountRequestBody(
  data: any,
): data is CreateAccount {
  return validate(data);
}
