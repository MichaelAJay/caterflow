import { Module } from '@nestjs/common';
import { GcpSecretManagerService } from './gcp-secret-manager.service';
import { CustomConfigModule } from 'src/utility/services/custom-config/custom-config.module';

@Module({
  imports: [CustomConfigModule],
  providers: [GcpSecretManagerService],
  exports: [GcpSecretManagerService],
})
export class GcpSecretManagerModule {}
