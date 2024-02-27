import Ajv, { FormatDefinition } from 'ajv';

const emailFormat: FormatDefinition<string> = {
  validate: (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
};

const ajvSingleton = new Ajv({ allErrors: true });
ajvSingleton.addFormat('email', emailFormat);
export default ajvSingleton;
