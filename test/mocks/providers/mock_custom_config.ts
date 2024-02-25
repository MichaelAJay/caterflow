import { ICustomConfigService } from 'src/utility/services/interfaces/custom-config.service.interface';

export const mockCustomConfig: ICustomConfigService = {
  getEnvVariable: jest.fn(),
};
