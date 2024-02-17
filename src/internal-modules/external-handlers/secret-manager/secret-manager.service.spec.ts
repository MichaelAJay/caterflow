import { Test, TestingModule } from '@nestjs/testing';
import { SecretManagerService } from './secret-manager.service';

describe('SecretManagerService', () => {
  let service: SecretManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SecretManagerService],
    }).compile();

    service = module.get<SecretManagerService>(SecretManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
