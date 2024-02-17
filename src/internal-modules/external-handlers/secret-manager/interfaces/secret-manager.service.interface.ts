export interface SecretManager {
  getSecret(secretName: string): Promise<string>;
}
