import { Module } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { SecretManagerModule } from '../../../internal-modules/external-handlers/secret-manager/secret-manager.module';

@Module({
  imports: [SecretManagerModule],
  providers: [CryptoService],
  exports: [CryptoService],
})
export class CryptoModule {}
