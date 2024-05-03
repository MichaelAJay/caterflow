import { Test, TestingModule } from '@nestjs/testing';
import { OrderMongoDbHandlerService } from './order-mongo-db-handler.service';

describe('OrderMongoDbHandlerService', () => {
  let service: OrderMongoDbHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderMongoDbHandlerService],
    }).compile();

    service = module.get<OrderMongoDbHandlerService>(OrderMongoDbHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
