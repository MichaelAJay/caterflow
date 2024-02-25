import { Test, TestingModule } from '@nestjs/testing';
import { SecretManagerService } from './secret-manager.service';
import { GcpSecretManagerService } from '../../../external-modules/gcp-secret-manager/gcp-secret-manager.service';
import { CustomConfigService } from '../../../utility/services/custom-config.service';
import { mockGcpSecretManagerService } from '../../../../test/mocks/providers/mock_gcp_secret_manager';
import { mockCustomConfig } from '../../../../test/mocks/providers/mock_custom_config';

describe('SecretManagerService', () => {
  let service: SecretManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SecretManagerService,
        {
          provide: GcpSecretManagerService,
          useValue: mockGcpSecretManagerService,
        },
        { provide: CustomConfigService, useValue: mockCustomConfig },
      ],
    }).compile();

    service = module.get<SecretManagerService>(SecretManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
