import { Module } from '@nestjs/common';
import { OrderMongoDbHandlerService } from './order-mongo-db-handler.service';
import { MongoClientModule } from 'src/external-modules/mongo-client/mongo-client.module';

@Module({
  imports: [MongoClientModule],
  providers: [OrderMongoDbHandlerService],
  exports: [OrderMongoDbHandlerService],
})
export class OrderMongoDbHandlerModule {}
