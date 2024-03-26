import { Test, TestingModule } from '@nestjs/testing';
import { LoggingInterceptor } from './logging.interceptor';
import { LogService } from '../../../system/modules/log/log.service';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { mockLogService } from '../../../../test/mocks/providers/mock_log_service';
import { FastifyRequest } from 'fastify';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let logService: LogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggingInterceptor,
        {
          provide: LogService,
          useValue: mockLogService,
        },
      ],
    }).compile();

    interceptor = module.get<LoggingInterceptor>(LoggingInterceptor);
    logService = module.get<LogService>(LogService);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should log GET request successfully', () => {
    const context = {
      switchToHttp: () => ({
        getRequest: (): Partial<FastifyRequest> => ({
          method: 'GET',
          url: '/test-get',
        }),
        getResponse: () => ({
          statusCode: 200,
          raw: { statusCode: 200 },
        }),
      }),
    } as unknown as ExecutionContext;

    const next: CallHandler = {
      handle: () => of('response'),
    };

    interceptor.intercept(context, next).subscribe();

    expect(logService.info).toHaveBeenCalledWith(
      expect.stringContaining('GET /test-get 200'),
      expect.objectContaining({
        method: 'GET',
        url: '/test-get',
        statusCode: 200,
        roundtrip: expect.any(String),
      }),
    );
  });

  it('should log POST request with a different status code', () => {
    const context = {
      switchToHttp: () => ({
        getRequest: (): Partial<FastifyRequest> => ({
          method: 'POST',
          url: '/test-post',
        }),
        getResponse: () => ({
          statusCode: 201,
          raw: { statusCode: 201 },
        }),
      }),
    } as unknown as ExecutionContext;

    const next: CallHandler = {
      handle: () => of('response'),
    };

    interceptor.intercept(context, next).subscribe();

    expect(logService.info).toHaveBeenCalledWith(
      expect.stringContaining('POST /test-post 201'),
      expect.objectContaining({
        method: 'POST',
        url: '/test-post',
        statusCode: 201,
        roundtrip: expect.any(String),
      }),
    );
  });

  it('should accurately calculate and log the round-trip time', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

    const context = {
      switchToHttp: () => ({
        getRequest: (): Partial<FastifyRequest> => ({
          method: 'GET',
          url: '/timing',
        }),
        getResponse: () => ({
          statusCode: 200,
          raw: { statusCode: 200 },
        }),
      }),
    } as unknown as ExecutionContext;

    const next: CallHandler = {
      handle: () => {
        jest.advanceTimersByTime(50); // Simulate a delay in the request handling
        return of('response');
      },
    };

    interceptor.intercept(context, next).subscribe();

    expect(logService.info).toHaveBeenCalledWith(
      expect.stringContaining('50ms'),
      expect.objectContaining({
        method: 'GET',
        url: '/timing',
        statusCode: 200,
        roundtrip: '50ms',
      }),
    );

    jest.useRealTimers();
  });
});
