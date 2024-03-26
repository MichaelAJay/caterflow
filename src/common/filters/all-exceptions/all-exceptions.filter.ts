import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { LogService } from '../../../system/modules/log/log.service';

@Catch()
export class AllExceptionsFilter<T extends { message?: string }>
  implements ExceptionFilter
{
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly logService: LogService,
  ) {}

  catch(exception: T, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      message:
        exception && exception.message
          ? exception.message
          : 'Unknown server error',
    };

    this.logService.error(
      `Error Response: ${JSON.stringify(errorResponse)}`,
      `${exception instanceof Error && exception.stack ? exception.stack : 'no trace'}`,
    );

    httpAdapter.reply(ctx.getResponse(), errorResponse, httpStatus);
  }
}
