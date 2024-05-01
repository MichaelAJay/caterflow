import { Module } from '@nestjs/common';
import { MongoClientService } from './mongo-client.service';

@Module({
  providers: [MongoClientService]
})
export class MongoClientModule {}
