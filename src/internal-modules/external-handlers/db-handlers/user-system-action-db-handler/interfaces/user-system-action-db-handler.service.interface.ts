import { IBuildCreateUserSystemActionArgs } from './query-builder-args.interface';

export interface IUserSystemActionDbHandler {
  create(input: IBuildCreateUserSystemActionArgs): Promise<any>;
  createMany(input: IBuildCreateUserSystemActionArgs[]): Promise<any>;
  retrieveOne(id: string): Promise<any>;
  retrieve(): Promise<any>;
}
