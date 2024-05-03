import { Module } from '@nestjs/common';
import { MongoClientService } from './mongo-client.service';
import { SecretManagerModule } from '../../internal-modules/external-handlers/secret-manager/secret-manager.module';

@Module({
  imports: [SecretManagerModule],
  providers: [MongoClientService],
  exports: [MongoClientService],
})
export class MongoClientModule {}
