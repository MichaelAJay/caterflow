import { Module } from '@nestjs/common';
import { SecretManagerService } from './secret-manager.service';
import { GcpSecretManagerModule } from 'src/external-modules/gcp-secret-manager/gcp-secret-manager.module';
import { CustomConfigModule } from 'src/utility/services/custom-config/custom-config.module';

@Module({
  imports: [CustomConfigModule, GcpSecretManagerModule],
  providers: [SecretManagerService],
  exports: [SecretManagerService],
})
export class SecretManagerModule {}
