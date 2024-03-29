import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { UserSystemActionDbHandlerService } from '../../../internal-modules/external-handlers/db-handlers/user-system-action-db-handler/user-system-action-db-handler.service';
import {
  buildErrorContextForLog,
  buildSystemActionsForDB,
} from './utilities/utility-functions';
import { LogService } from '../../../system/modules/log/log.service';
import { AuthenticatedRequest } from 'src/api/interfaces/authenticated-request.interface';
import { IBuildCreateUserSystemActionArgs } from 'src/internal-modules/external-handlers/db-handlers/user-system-action-db-handler/interfaces/query-builder-args.interface';

@Injectable()
export class ActionLoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly userSystemActionDbHandler: UserSystemActionDbHandlerService,
    private readonly logService: LogService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(() => {
        const request = context
          .switchToHttp()
          .getRequest() as AuthenticatedRequest;
        try {
          const createArgs = buildSystemActionsForDB(request);
          this.executeDbOperation(createArgs, request);
        } catch (err) {
          const context = buildErrorContextForLog(request);
          this.logService.warn(err.message, context);
        }
      }),
    );
  }

  executeDbOperation(
    createArgs: IBuildCreateUserSystemActionArgs[],
    request: AuthenticatedRequest,
  ): void {
    const operationPromise =
      createArgs.length === 1
        ? this.userSystemActionDbHandler.create(createArgs[0])
        : this.userSystemActionDbHandler.createMany(createArgs);
    operationPromise.catch((err) => {
      const context = buildErrorContextForLog(request);
      this.logService.warn(err.message, context);
    });
  }
}
