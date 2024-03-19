import { Injectable } from '@nestjs/common';
import { ICateringCompanyDbQueryBuilder } from './interfaces/catering-company-db-query-builder.service.interface';
import { Prisma } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { IBuildCreateCateringCompanyArgs } from './interfaces/query-builder-args.interfaces';

@Injectable()
export class CateringCompanyDbQueryBuilderService
  implements ICateringCompanyDbQueryBuilder
{
  buildCreateCateringCompanyQuery(
    input: IBuildCreateCateringCompanyArgs,
  ): Prisma.CateringCompanyCreateArgs<DefaultArgs> {
    return {
      data: input,
    };
  }
}
