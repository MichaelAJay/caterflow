export interface ExternalSecretManager {
  getSecret(secretName: string): Promise<string>;
  upsertSecret(secretName: string, secretValue: Buffer): Promise<void>;
}
