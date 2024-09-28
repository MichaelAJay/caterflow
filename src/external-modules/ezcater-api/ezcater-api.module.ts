import { Module } from '@nestjs/common';
import { EzCaterApiService } from './ezcater-api.service';
import { SecretManagerModule } from '../../internal-modules/external-handlers/secret-manager/secret-manager.module';
import { CustomConfigModule } from '../../utility/services/custom-config/custom-config.module';

@Module({
  imports: [SecretManagerModule, CustomConfigModule],
  providers: [EzCaterApiService],
  exports: [EzCaterApiService],
})
export class EzCaterApiModule {}
