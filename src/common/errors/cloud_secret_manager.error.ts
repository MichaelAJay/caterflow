export class CloudSecretManagerError extends Error {
  constructor(secretName: string) {
    super(`Secret ${secretName} not found or has no data.`);
    this.name = 'CloudSecretManagerError';
  }
}
