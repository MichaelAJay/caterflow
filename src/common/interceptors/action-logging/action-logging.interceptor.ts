import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { UserSystemActionDbHandlerService } from '../../../internal-modules/external-handlers/db-handlers/user-system-action-db-handler/user-system-action-db-handler.service';
import actionLoggingUtilities from './utilities/action-logging-utilities';
import { LogService } from '../../../system/modules/log/log.service';
import { AuthenticatedRequest } from 'src/api/interfaces/authenticated-request.interface';
import { IBuildCreateUserSystemActionArgs } from 'src/internal-modules/external-handlers/db-handlers/user-system-action-db-handler/interfaces/query-builder-args.interface';
import { $Enums } from '@prisma/client';

@Injectable()
export class ActionLoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly userSystemActionDbHandler: UserSystemActionDbHandlerService,
    private readonly logService: LogService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(() => {
        this.logUserAction(context, $Enums.SystemActionResult.SUCCESS);
      }),
      catchError((err) => {
        this.logUserAction(context, $Enums.SystemActionResult.ERROR);
        // Pass through error
        return throwError(() => err);
      }),
    );
  }

  logUserAction(
    context: ExecutionContext,
    actionResult: $Enums.SystemActionResult,
  ): void {
    const request = context.switchToHttp().getRequest() as AuthenticatedRequest;
    try {
      const createArgs = actionLoggingUtilities.buildSystemActionsForDb(
        request,
        actionResult,
      );
      if (createArgs.length > 0) {
        this.executeDbOperation(createArgs, request);
      }
    } catch (err) {
      const logContext =
        actionLoggingUtilities.buildErrorContextForLog(request);
      this.logService.warn(err.message, logContext);
    }
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
      const context = actionLoggingUtilities.buildErrorContextForLog(request);
      this.logService.warn(err.message, context);
    });
  }
}
