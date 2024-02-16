import { Module } from '@nestjs/common';
import { GcpSecretManagerService } from './gcp-secret-manager.service';

@Module({
  providers: [GcpSecretManagerService]
})
export class GcpSecretManagerModule {}
