export interface SecretManager {
  getSecret(secretName: string): Promise<string>;
  upsertSecret(secretName: string, secretValue: Buffer): Promise<void>;
}
