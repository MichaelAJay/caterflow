import { Module } from '@nestjs/common';
import { SecretManagerService } from './secret-manager.service';
import { GcpSecretManagerModule } from 'src/external-modules/gcp-secret-manager/gcp-secret-manager.module';

@Module({
  imports: [GcpSecretManagerModule],
  providers: [SecretManagerService],
  exports: [SecretManagerService],
})
export class SecretManagerModule {}
