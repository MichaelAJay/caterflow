import { Test, TestingModule } from '@nestjs/testing';
import { AccountDbHandlerService } from './account-db-handler.service';

describe('AccountDbHandlerService', () => {
  let service: AccountDbHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountDbHandlerService],
    }).compile();

    service = module.get<AccountDbHandlerService>(AccountDbHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
