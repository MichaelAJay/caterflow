export interface ICustomConfigService {
  getEnvVariable<T>(key: string, defaultValue?: T): T;
}
