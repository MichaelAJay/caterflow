import { Injectable } from '@nestjs/common';
import { PrismaClientService } from '../../src/external-modules/prisma-client/prisma-client.service';

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
        !key.startsWith('$'),
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
      }
    }
  }

  private mockCreate(model: string, args: any) {
    console.log(`Mocked create operation for ${model}`, args);
    return Promise.resolve({ id: 'mocked-id', ...args.data });
  }

  private mockCreateMany(model: string, args: any) {
    console.log(`Mocked createMany operation for ${model}`, args);
    return Promise.resolve({ count: args.data.length });
  }

  private mockUpdate(model: string, args: any) {
    console.log(`Mocked update operation for ${model}`, args);
    return Promise.resolve({ id: 'mocked-id', ...args.data });
  }

  private mockUpdateMany(model: string, args: any) {
    console.log(`Mocked updateMany operation for ${model}`, args);
    return Promise.resolve({ count: 1 });
  }

  private mockUpsert(model: string, args: any) {
    console.log(`Mocked upsert operation for ${model}`, args);
    return Promise.resolve({ id: 'mocked-id', ...args.create });
  }
}
