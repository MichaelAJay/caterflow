import { Injectable } from '@nestjs/common';
import { GcpSecretManagerService } from 'src/external-modules/gcp-secret-manager/gcp-secret-manager.service';
import { SecretManager } from './interfaces/secret-manager.service.interface';

@Injectable()
export class SecretManagerService implements SecretManager {
  constructor(
    private readonly cloudSecretManagerService: GcpSecretManagerService,
  ) {}
  async getSecret(secretName: string): Promise<string> {
    // if ()
    return secretName;
  }
}
