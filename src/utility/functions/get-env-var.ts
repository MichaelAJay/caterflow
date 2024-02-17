type ConvertTo = 'boolean' | 'number';

export function getEnvVariable<T = string>(
  name: string,
  throwOnUndefined = true,
  convertTo?: ConvertTo,
): T {
  const value = process.env[name];

  if (value === undefined && throwOnUndefined) {
    throw new Error(`Environment variable ${name} is not defined.`);
  }

  if (convertTo) {
    switch (convertTo) {
      case 'boolean':
        // Handle value undefined & throwOnUndefined false
        if (value === undefined) {
          return false as unknown as T;
        }

        const lowerCasedValue = value.toLowerCase();
        if (lowerCasedValue === 'true' || lowerCasedValue === 'false') {
          return (lowerCasedValue === 'true') as unknown as T;
        } else {
          throw new Error(`Cannot convert "${value}" to boolean.`);
        }
      case 'number':
        // Handle value undefined & throwOnUndefined false
        if (value === undefined) {
          return 0 as unknown as T;
        }

        const parsedValue = parseFloat(value);
        if (!isNaN(parsedValue)) {
          return parsedValue as unknown as T;
        } else {
          throw new Error(`Cannot convert "${value}" to number.`);
        }
    }
  }

  return (value || '') as unknown as T;
}
