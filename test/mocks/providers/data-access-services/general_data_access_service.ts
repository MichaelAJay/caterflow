import { IDataAccessService } from 'src/internal-modules/external-handlers/data-access/interfaces/data-access.service.interface';

export const mockGeneralDataAccessService: IDataAccessService<T> = {
  get: function (key: string): Promise<any> {
    throw new Error('Function not implemented.');
  },
  set: function (
    key: string,
    value: T,
    ttl?: number | undefined,
  ): Promise<boolean> {
    throw new Error('Function not implemented.');
  },
  retrieveAndCache: function (
    key: string,
    fetchFunction: () => Promise<any>,
    ttl?: number | undefined,
  ): Promise<any> {
    throw new Error('Function not implemented.');
  },
};
