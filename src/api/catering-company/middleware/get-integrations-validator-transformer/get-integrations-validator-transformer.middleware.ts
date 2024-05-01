import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { validateGetCompanyIntegrationsListQuery } from '../../validators/get.integration-lists';
import dateUtils from '../../../../utility/functions/date-utils';
import { IBuildGetCompanyIntegrationListArgs } from '../../../../internal-modules/external-handlers/db-handlers/catering-company-db-handler/interfaces/query-builder-args.interfaces';

@Injectable()
export class GetCompanyIntegrationsValidatorTransformerMiddleware
  implements NestMiddleware
{
  use(req: FastifyRequest, res: FastifyReply, next: () => void) {
    const query = req.query as unknown;

    if (!validateGetCompanyIntegrationsListQuery(query)) {
      throw new BadRequestException({
        error: 'Invalid query parameters',
        details: validateGetCompanyIntegrationsListQuery.errors,
      });
    }

    const transformedQuery: IBuildGetCompanyIntegrationListArgs = {
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
      // templateSrcSystem: query.template_src,
      // templateTargetSystem: query.template_target,
      sort: query.sort,
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
