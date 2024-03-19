import { ICustomConfigService } from 'src/utility/services/custom-config/interfaces/custom-config.service.interface';

export const mockCustomConfig: ICustomConfigService = {
  getEnvVariable: jest.fn(),
};
