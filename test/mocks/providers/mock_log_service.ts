import { ILogService } from 'src/system/modules/log/interfaces/log.service.interface';

export const mockLogService: ILogService = {
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
};
