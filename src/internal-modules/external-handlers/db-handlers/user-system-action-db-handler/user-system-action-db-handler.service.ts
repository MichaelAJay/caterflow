import { Injectable } from '@nestjs/common';
import { IUserSystemActionDbHandler } from './interfaces/user-system-action-db-handler.service.interface';
import { PrismaClientService } from '../../../../external-modules/prisma-client/prisma-client.service';
import { UserSystemActionDbQueryBuilderService } from './user-system-action-db-query-builder.service';
import { IBuildCreateUserSystemActionArgs } from './interfaces/query-builder-args.interface';

@Injectable()
export class UserSystemActionDbHandlerService
  implements IUserSystemActionDbHandler
{
  constructor(
    private readonly prismaClient: PrismaClientService,
    private readonly userSystemActionQueryBuilder: UserSystemActionDbQueryBuilderService,
  ) {}
  async create(input: IBuildCreateUserSystemActionArgs): Promise<any> {
    try {
      const result = await this.prismaClient.userSystemAction.create(
        this.userSystemActionQueryBuilder.buildCreateUserSystemActionQuery(
          input,
        ),
      );
      return result;
    } catch (err) {
      // console.error(err);
      throw err;
    }
  }
  async createMany(input: IBuildCreateUserSystemActionArgs[]): Promise<any> {
    try {
      const result = await this.prismaClient.userSystemAction.createMany(
        this.userSystemActionQueryBuilder.buildCreateManyUserSystemActionsQuery(
          input,
        ),
      );
      return result;
    } catch (err) {
      throw err;
    }
  }
  async retrieveOne(id: string): Promise<any> {
    try {
      const result = await this.prismaClient.userSystemAction.findUnique(
        this.userSystemActionQueryBuilder.buildRetrieveUniqueUserSystemActionQuery(
          id,
        ),
      );
      return result;
    } catch (err) {
      // console.error(err);
      throw err;
    }
  }
  /**
   * @TODO unimplemented - requires pagination
   */
  async retrieve(): Promise<any> {
    try {
      throw new Error('Method not implemented.');
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}
