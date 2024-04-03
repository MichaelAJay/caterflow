import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { validateGetIntegrationsListQuery } from '../../validators/get.integration-lists';
import dateUtils from '../../../../utility/functions/date-utils';
import { IBuildRetrieveIntegrationListArgs } from 'src/internal-modules/external-handlers/db-handlers/catering-company-db-handler/interfaces/query-builder-args.interfaces';

@Injectable()
export class GetIntegrationsValidatorTransformerMiddleware
  implements NestMiddleware
{
  use(req: FastifyRequest, res: FastifyReply, next: () => void) {
    const query = req.query as unknown;

    if (!validateGetIntegrationsListQuery(query)) {
      throw new BadRequestException({
        error: 'Invalid query parameters',
        details: validateGetIntegrationsListQuery.errors,
      });
    }

    const transformedQuery: IBuildRetrieveIntegrationListArgs = {
      pg: query.pg ? parseInt(query.pg, 10) : undefined,
      perPage: query.per_page ? parseInt(query.per_page, 10) : undefined,
      isConfigured: query.filter_configured
        ? query.filter_configured === 'true'
        : undefined,
      isActive: query.filter_active
        ? query.filter_active === 'true'
        : undefined,
      createdSince: query.created_since
        ? dateUtils.transformCreatedSinceToDate(query.created_since)
        : undefined,
      templateSrcSystem: query.template_src,
      templateTargetSystem: query.template_target,
      sort: query.sort,
    };

    req.query = transformedQuery;
    next();
  }
}
