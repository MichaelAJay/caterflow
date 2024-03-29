import { Test, TestingModule } from '@nestjs/testing';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { HttpAdapterHost } from '@nestjs/core';
import { LogService } from '../../../system/modules/log/log.service';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { mockLogService } from '../../../../test/mocks/providers/mock_log_service';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter<any>;
  let logService: LogService;
  let httpAdapterHost: HttpAdapterHost;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AllExceptionsFilter,
        {
          provide: LogService,
          useValue: mockLogService,
        },
        {
          provide: HttpAdapterHost,
          useValue: {
            httpAdapter: {
              reply: jest.fn(),
              getRequestUrl: jest.fn().mockReturnValue('/test/url'),
            },
          },
        },
      ],
    }).compile();

    filter = module.get<AllExceptionsFilter<any>>(AllExceptionsFilter);
    logService = module.get<LogService>(LogService);
    httpAdapterHost = module.get<HttpAdapterHost>(HttpAdapterHost);
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should catch HTTP exceptions and log them', () => {
    const exception = new HttpException(
      'HTTP Test Exception',
      HttpStatus.BAD_REQUEST,
    );
    const host = {
      switchToHttp: () => ({
        getRequest: () => ({}),
        getResponse: () => ({}),
      }),
    };

    filter.catch(exception, host as ArgumentsHost);

    expect(logService.error).toHaveBeenCalledWith(
      expect.stringContaining('Error Response:'),
      expect.any(String),
    );
    expect(httpAdapterHost.httpAdapter.reply).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'HTTP Test Exception',
      }),
      HttpStatus.BAD_REQUEST,
    );
  });

  it('should handle non-HTTP exceptions as internal server errors', () => {
    const exception = new Error('Generic Error');
    const host = {
      switchToHttp: () => ({
        getRequest: () => ({}),
        getResponse: () => ({}),
      }),
    };

    filter.catch(exception, host as ArgumentsHost);

    expect(logService.error).toHaveBeenCalledWith(
      expect.stringContaining('Error Response:'),
      expect.any(String),
    );
    expect(httpAdapterHost.httpAdapter.reply).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Generic Error',
      }),
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  });

  it('should use a generic error message if exception message is undefined', () => {
    const exception: { message?: string } = new Error(); // no message provided
    exception.message = undefined; // explicitly make it undefined
    const host = {
      switchToHttp: () => ({
        getRequest: () => ({}),
        getResponse: () => ({}),
      }),
    };

    filter.catch(exception, host as ArgumentsHost);

    expect(logService.error).toHaveBeenCalledWith(
      expect.stringContaining('Error Response:'),
      expect.any(String),
    );
    expect(httpAdapterHost.httpAdapter.reply).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Unknown server error',
      }),
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  });

  it('should handle exceptions without a message property', () => {
    const exception = {}; // Empty object without a message property
    const host = getMockHost();

    filter.catch(exception as any, host as ArgumentsHost);

    expect(httpAdapterHost.httpAdapter.reply).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        message: 'Unknown server error', // Default message
      }),
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  });

  it('should gracefully handle non-object exceptions', () => {
    const exception = 'String based exception';
    const host = getMockHost();

    filter.catch(exception as any, host as ArgumentsHost);

    expect(httpAdapterHost.httpAdapter.reply).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        message: 'Unknown server error', // Default message for non-object
      }),
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  });

  it('should handle null exception without throwing', () => {
    const exception = null;
    const host = getMockHost();

    expect(() =>
      filter.catch(exception as any, host as ArgumentsHost),
    ).not.toThrow();
  });

  it('should process custom exception classes correctly', () => {
    class CustomException extends Error {
      constructor(message: string) {
        super(message);
        this.name = 'CustomException';
      }
    }

    const exception = new CustomException('Custom error occurred');
    const host = getMockHost();

    filter.catch(exception, host as ArgumentsHost);

    expect(httpAdapterHost.httpAdapter.reply).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        message: 'Custom error occurred',
      }),
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  });

  it('should handle HttpException with custom response body', () => {
    const exception = new HttpException(
      {
        error: 'Custom error',
        statusCode: HttpStatus.FORBIDDEN,
      },
      HttpStatus.FORBIDDEN,
    );
    const host = getMockHost();

    filter.catch(exception, host as ArgumentsHost);

    expect(httpAdapterHost.httpAdapter.reply).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        statusCode: HttpStatus.FORBIDDEN,
        message: expect.anything(), // Since the message might be derived differently
      }),
      HttpStatus.FORBIDDEN,
    );
  });

  // Utility function to return a mock host object
  function getMockHost() {
    return {
      switchToHttp: () => ({
        getRequest: () => ({}),
        getResponse: () => ({}),
      }),
    };
  }
});
