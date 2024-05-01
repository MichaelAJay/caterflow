import { BadRequestException } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { GetSystemIntegrationsValidatorTransformerMiddleware } from './get-integrations-validator-transformer.middleware';
import dateUtils from '../../../../utility/functions/date-utils';
import { IBuildGetManyQueryInputArgs } from 'src/internal-modules/external-handlers/db-handlers/catering-company-db-handler/interfaces/query-builder-args.interfaces';

describe('GetIntegrationsValidatorTransformerMiddleware', () => {
  let middleware: GetSystemIntegrationsValidatorTransformerMiddleware;
  let req: FastifyRequest;
  let res: FastifyReply;
  let next: jest.Mock;

  beforeEach(() => {
    middleware = new GetSystemIntegrationsValidatorTransformerMiddleware();
    req = {
      query: {},
    } as unknown as FastifyRequest;
    res = {} as FastifyReply;
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should pass validation and transform query parameters', () => {
    req.query = {
      pg: '1',
      per_page: '10',
      template_src: 'ezCater',
      template_target: 'Nutshell',
    };

    const transformedQuery: IBuildGetManyQueryInputArgs = {
      pg: 1,
      perPage: 10,
      templateSrcSystem: 'ezCater',
      templateTargetSystem: 'Nutshell',
    };

    middleware.use(req, res, next);

    expect(req.query).toEqual(transformedQuery);
    expect(next).toHaveBeenCalled();
  });

  it('should have undefined for optional boolean properties if query does not include them', () => {
    req.query = {
      per_page: '1',
    };

    const transformedQuery = {
      perPage: 1,
    };

    middleware.use(req, res, next);

    expect(req.query).toEqual(transformedQuery);
    expect((req.query as any).pg).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });

  it('should throw BadRequestException for invalid query parameters', () => {
    req.query = {
      pg: 'invalid',
      per_page: 'invalid',
      template_src: 'invalid',
      template_target: 'invalid',
    };

    expect(() => middleware.use(req, res, next)).toThrow(BadRequestException);
    expect(next).not.toHaveBeenCalled();
  });

  it('should handle optional query parameters', () => {
    req.query = {};

    middleware.use(req, res, next);

    expect(req.query).toEqual({
      pg: undefined,
      perPage: undefined,
      templateSrcSystem: undefined,
      templateTargetSystem: undefined,
    });
    expect(next).toHaveBeenCalled();
  });
});
