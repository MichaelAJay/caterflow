import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { LogService } from 'src/system/modules/log/log.service';
import { FastifyRequest, FastifyReply } from 'fastify';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logService: LogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const timeIn = Date.now();
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<FastifyRequest>();
    const response = httpContext.getResponse<FastifyReply>();

    const method = request.method;
    const url = request.url;
    return next.handle().pipe(
      tap(() => {
        const statusCode = response.statusCode || response.raw.statusCode;
        const roundtrip = `${Date.now() - timeIn}ms`;
        const logContext = {
          method,
          url,
          statusCode,
          roundtrip,
        };
        this.logService.info(
          `${method} ${url} ${statusCode} ${roundtrip}`,
          logContext,
        );
      }),
    );
  }
}
