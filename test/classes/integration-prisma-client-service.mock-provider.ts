import { Injectable } from '@nestjs/common';
import { PrismaClientService } from '../../src/external-modules/prisma-client/prisma-client.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class IntegrationPrismaClientService extends PrismaClientService {
  [key: string]: any;

  constructor() {
    super();
    this.overrideMethods();
  }

  private overrideMethods() {
    const models = Object.getOwnPropertyNames(this).filter(
      (key) =>
        typeof this[key as keyof this] === 'object' &&
        this[key as keyof this] !== null &&
        !key.startsWith('$') &&
        !key.startsWith('_'),
    );

    for (const model of models) {
      const modelClient = <unknown>(<any>this[model]);
      if (modelClient && typeof modelClient === 'object') {
        if ('create' in modelClient) {
          modelClient.create = this.mockCreate.bind(this, model) as any;
        }
        if ('createMany' in modelClient) {
          modelClient.createMany = this.mockCreateMany.bind(this, model) as any;
        }
        if ('update' in modelClient) {
          modelClient.update = this.mockUpdate.bind(this, model) as any;
        }
        if ('updateMany' in modelClient) {
          modelClient.updateMany = this.mockUpdateMany.bind(this, model) as any;
        }
        if ('upsert' in modelClient) {
          modelClient.upsert = this.mockUpsert.bind(this, model) as any;
        }
        if ('delete' in modelClient) {
          modelClient.delete = this.mockDelete.bind(this, model) as any;
        }
        if ('deleteMany' in modelClient) {
          modelClient.deleteMany = this.mockDeleteMany.bind(this, model) as any;
        }
      }
    }
  }

  /**
   * REFERENCE
   */
  // /**
  //  * Create a CompanyExternalSystemConnection.
  //  * @param {CompanyExternalSystemConnectionCreateArgs} args - Arguments to create a CompanyExternalSystemConnection.
  //  * @example
  //  * // Create one CompanyExternalSystemConnection
  //  * const CompanyExternalSystemConnection = await prisma.companyExternalSystemConnection.create({
  //  *   data: {
  //  *     // ... data to create a CompanyExternalSystemConnection
  //  *   }
  //  * })
  //  *
  //  **/
  // create<T extends CompanyExternalSystemConnectionCreateArgs<ExtArgs>>(
  //   args: SelectSubset<T, CompanyExternalSystemConnectionCreateArgs<ExtArgs>>,
  // ): Prisma__CompanyExternalSystemConnectionClient<
  //   $Result.GetResult<
  //     Prisma.$CompanyExternalSystemConnectionPayload<ExtArgs>,
  //     T,
  //     'create'
  //   >,
  //   never,
  //   ExtArgs
  // >;
  /**
   * CompanyExternalSystemConnection create
   */
  // export type CompanyExternalSystemConnectionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
  //   /**
  //    * Select specific fields to fetch from the CompanyExternalSystemConnection
  //    */
  //   select?: CompanyExternalSystemConnectionSelect<ExtArgs> | null
  //   /**
  //    * Choose, which related nodes to fetch as well.
  //    */
  //   include?: CompanyExternalSystemConnectionInclude<ExtArgs> | null
  //   /**
  //    * The data needed to create a CompanyExternalSystemConnection.
  //    */
  //   data: XOR<CompanyExternalSystemConnectionCreateInput, CompanyExternalSystemConnectionUncheckedCreateInput>
  // }

  private async mockCreate<
    TCreateArgsSubType extends { data: any; select: any },
    TCreateArgs,
    TReturn,
  >(
    model: string,
    args: Omit<Prisma.SelectSubset<TCreateArgsSubType, TCreateArgs>, 'include'>,
  ): Promise<TReturn> {
    console.log(`Mocked create operation for ${model}`, args);
    let result = { id: 'mocked-id', ...args.data };

    if (args.select) {
      result = Object.keys(args.select).reduce((selectedResult, key) => {
        if (args.select[key]) {
          selectedResult[key] = result[key];
        }
        return selectedResult;
      }, {} as any);
    }

    return result;
  }

  private async mockCreateMany(model: string, args: any) {
    console.log(`Mocked createMany operation for ${model}`, args);
    return { count: args.data.length, mockCalled: true };
  }

  private async mockUpdate(model: string, args: any) {
    console.log(`Mocked update operation for ${model}`, args);
    return { id: 'mocked-id', mockCalled: true, ...args.data };
  }

  private async mockUpdateMany(model: string, args: any) {
    console.log(`Mocked updateMany operation for ${model}`, args);
    return { count: 1, mockCalled: true };
  }

  private async mockUpsert(model: string, args: any) {
    console.log(`Mocked upsert operation for ${model}`, args);
    return { id: 'mocked-id', mockCalled: true, ...args.create };
  }

  private async mockDelete(model: string, args: any) {
    console.log(`Mocked delete operation for ${model}`, args);
    return { id: 'mock-deleted-id', name: args.where.name, mockCalled: true };
  }

  private async mockDeleteMany(model: string, args: any) {
    console.log(`Mocked deleteMany operation for ${model}`, args);
    return { count: 1, mockCalled: true };
  }
}
