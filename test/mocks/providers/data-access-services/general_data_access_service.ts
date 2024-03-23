import { IDataAccessService } from 'src/internal-modules/external-handlers/data-access/interfaces/data-access.service.interface';

export const mockGeneralDataAccessService: IDataAccessService<any> = {
  get: jest.fn(),
  set: jest.fn(),
  retrieveAndCache: jest.fn(),
};
