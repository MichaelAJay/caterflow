import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { UserSystemActionDbHandlerService } from '../../../internal-modules/external-handlers/db-handlers/user-system-action-db-handler/user-system-action-db-handler.service';
import { buildSystemActionsForDB } from './utilities/utility-functions';

@Injectable()
export class ActionLoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly userSystemActionDbHandler: UserSystemActionDbHandlerService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // @TODO check
    const action = request.route.path;

    return next.handle().pipe(
      tap(() => {
        const createArgs = buildSystemActionsForDB(request);
        if (createArgs.length === 1) {
          // Create one
        } else {
          // Create many
        }

        console.log('Db method here');
      }),
    );
  }
}
