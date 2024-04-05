import { BadRequestException } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { GetCompanyIntegrationsValidatorTransformerMiddleware } from './get-integrations-validator-transformer.middleware';
import dateUtils from '../../../../utility/functions/date-utils';

describe('GetIntegrationsValidatorTransformerMiddleware', () => {
  let middleware: GetCompanyIntegrationsValidatorTransformerMiddleware;
  let req: FastifyRequest;
  let res: FastifyReply;
  let next: jest.Mock;

  beforeEach(() => {
    middleware = new GetCompanyIntegrationsValidatorTransformerMiddleware();
    req = {
      query: {},
    } as unknown as FastifyRequest;
    res = {} as FastifyReply;
    next = jest.fn();
  });

  it('should pass validation and transform query parameters', () => {
    req.query = {
      pg: '1',
      per_page: '10',
      filter_configured: 'true',
      filter_active: 'false',
      created_since: 'last_week',
      template_src: 'ezCater',
      template_target: 'Nutshell',
      sort: 'created_asc',
    };

    const transformedQuery = {
      pg: 1,
      perPage: 10,
      isConfigured: true,
      isActive: false,
      createdSince: expect.any(Date),
      templateSrcSystem: 'ezCater',
      templateTargetSystem: 'Nutshell',
      sort: 'created_asc',
    };

    middleware.use(req, res, next);

    expect(req.query).toEqual(transformedQuery);
    expect(next).toHaveBeenCalled();
  });

  it('should have undefined for optional boolean properties if query does not include them', () => {
    req.query = {
      pg: '1',
    };

    const transformedQuery = {
      pg: 1,
      perPage: undefined,
      isConfigured: undefined,
      isActive: undefined,
      createdSince: undefined,
      templateSrcSystem: undefined,
      templateTargetSystem: undefined,
      sort: undefined,
    };

    middleware.use(req, res, next);

    expect(req.query).toEqual(transformedQuery);
    expect((req.query as any).isConfigured).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });

  it('should throw BadRequestException for invalid query parameters', () => {
    req.query = {
      pg: 'invalid',
      per_page: 'invalid',
      filter_configured: 'invalid',
      filter_active: 'invalid',
      created_since: 'invalid',
      template_src: 'invalid',
      template_target: 'invalid',
      sort: 'invalid',
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
      isConfigured: undefined,
      isActive: undefined,
      createdSince: undefined,
      templateSrcSystem: undefined,
      templateTargetSystem: undefined,
      sort: undefined,
    });
    expect(next).toHaveBeenCalled();
  });

  it('should transform createdSince query parameter using dateUtils', () => {
    const mockDate = new Date('2023-06-01');
    jest
      .spyOn(dateUtils, 'transformCreatedSinceToDate')
      .mockReturnValue(mockDate);

    req.query = {
      created_since: 'last_week',
    };

    middleware.use(req, res, next);

    expect((req.query as any).createdSince).toEqual(mockDate);
    expect(dateUtils.transformCreatedSinceToDate).toHaveBeenCalledWith(
      'last_week',
    );
    expect(next).toHaveBeenCalled();
  });
});
