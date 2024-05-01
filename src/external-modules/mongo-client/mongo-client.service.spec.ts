import { Test, TestingModule } from '@nestjs/testing';
import { MongoClientService } from './mongo-client.service';

describe('MongoClientService', () => {
  let service: MongoClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MongoClientService],
    }).compile();

    service = module.get<MongoClientService>(MongoClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
