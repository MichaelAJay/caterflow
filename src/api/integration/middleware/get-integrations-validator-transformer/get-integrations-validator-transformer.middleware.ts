import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { IBuildGetManyQueryInputArgs } from '../../../../internal-modules/external-handlers/db-handlers/catering-company-db-handler/interfaces/query-builder-args.interfaces';
import { validateGetSystemIntegrationsListQuery } from '../../validators/get.integration-lists';

@Injectable()
export class GetSystemIntegrationsValidatorTransformerMiddleware
  implements NestMiddleware
{
  use(req: FastifyRequest, res: FastifyReply, next: () => void) {
    const query = req.query as unknown;

    if (!validateGetSystemIntegrationsListQuery(query)) {
      throw new BadRequestException({
        error: 'Invalid query parameters',
        details: validateGetSystemIntegrationsListQuery.errors,
      });
    }

    const transformedQuery: IBuildGetManyQueryInputArgs = {
      pg: query.pg ? parseInt(query.pg, 10) : undefined,
      perPage: query.per_page ? parseInt(query.per_page, 10) : undefined,
      // templateSrcSystem: query.template_src,
      // templateTargetSystem: query.template_target,
    };

    if (
      (transformedQuery.pg && transformedQuery.pg < 1) ||
      (transformedQuery.perPage && transformedQuery.perPage < 1)
    ) {
      throw new BadRequestException({
        error:
          'Page number must be 1 or greater, and records per page must be 1 or greater',
      });
    }

    req.query = transformedQuery;
    next();
  }
}
