import { Test, TestingModule } from '@nestjs/testing';
import { UserDbHandlerService } from './user-db-handler.service';

describe('UserDbHandlerService', () => {
  let service: UserDbHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserDbHandlerService],
    }).compile();

    service = module.get<UserDbHandlerService>(UserDbHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
