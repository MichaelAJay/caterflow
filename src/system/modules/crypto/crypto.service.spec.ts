import { Test, TestingModule } from '@nestjs/testing';
import { CryptoService } from './crypto.service';
import { SecretManagerService } from '../../../internal-modules/external-handlers/secret-manager/secret-manager.service';
import { mockSecretManagerService } from '../../../../test/mocks/providers/mock_secret_manager';

describe('CryptoService', () => {
  let service: CryptoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CryptoService,
        { provide: SecretManagerService, useValue: mockSecretManagerService },
      ],
    }).compile();

    service = module.get<CryptoService>(CryptoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
