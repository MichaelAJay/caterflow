import { ICryptoService } from 'src/system/modules/crypto/interfaces/crypto.service.interface';

export const mockCryptoService: ICryptoService = {
  encrypt: jest.fn(),
  decrypt: jest.fn(),
  hash: jest.fn(),
};
