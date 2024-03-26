import { Test, TestingModule } from '@nestjs/testing';
import { UserSystemActionDbHandlerService } from './user-system-action-db-handler.service';

describe('UserSystemActionDbHandlerService', () => {
  let service: UserSystemActionDbHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserSystemActionDbHandlerService],
    }).compile();

    service = module.get<UserSystemActionDbHandlerService>(UserSystemActionDbHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
