import { Test, TestingModule } from '@nestjs/testing';
import { GcpSecretManagerService } from './gcp-secret-manager.service';

describe('GcpSecretManagerService', () => {
  let service: GcpSecretManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GcpSecretManagerService],
    }).compile();

    service = module.get<GcpSecretManagerService>(GcpSecretManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
