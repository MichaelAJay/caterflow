import { Test, TestingModule } from '@nestjs/testing';
import { GcpSecretManagerService } from './gcp-secret-manager.service';
import { CustomConfigService } from '../../utility/services/custom-config.service';
import { mockCustomConfig } from '../../../test/mocks/providers/mock_custom_config';

describe('GcpSecretManagerService', () => {
  let service: GcpSecretManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GcpSecretManagerService,
        { provide: CustomConfigService, useValue: mockCustomConfig },
      ],
    }).compile();

    service = module.get<GcpSecretManagerService>(GcpSecretManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
