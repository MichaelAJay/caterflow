import { $Enums, SystemAction } from '@prisma/client';
import { AuthenticatedRequest } from '../../../../api/interfaces/authenticated-request.interface';
import { IBuildCreateUserSystemActionArgs } from '../../../../internal-modules/external-handlers/db-handlers/user-system-action-db-handler/interfaces/query-builder-args.interface';
import { LogContext } from '../../../../system/modules/log/log.service';

// Routes should specify strings of form 'method:url' for each route that this interceptor services
type Route = 'TOP' | 'BOTTOM';
const routeActionMapper: Record<Route, SystemAction[]> = {
  TOP: ['AddIntegration'],
  BOTTOM: ['AddIntegration'],
};

export function buildSystemActionsForDB(
  request: AuthenticatedRequest,
  result: $Enums.SystemActionResult,
): IBuildCreateUserSystemActionArgs[] {
  const { method, url } = getRouteDetails(request);
  const { userId, companyId } = getUserDetails(request);

  /**
   * @TODO Figure out what to do with query params
   */

  const { pathname, searchParams } = new URL(url, 'http://localhost');

  const queryParams = Array.from(searchParams.entries());
  console.log(queryParams);

  // Get route key
  const routeKey = getRouteKey(method, pathname);

  // Get SystemActions
  const systemActions = routeActionMapper[routeKey];

  return buildSystemActionsForCreation(
    systemActions,
    userId,
    companyId,
    result,
  );
}

function getRouteDetails(request: AuthenticatedRequest): {
  method: string;
  url: string;
} {
  const { method, url } = request.raw;
  if (!(typeof method === 'string' && typeof url === 'string')) {
    throw new Error('Request object could not parse method and url');
  }
  return { method, url };
}

function getUserDetails(request: AuthenticatedRequest): {
  userId: string;
  companyId: string;
} {
  const { user } = request;
  if (!(user && user.id && user.companyId)) {
    throw new Error('Request body is missing user, user id, or company id');
  }
  return { userId: user.id, companyId: user.companyId };
}

function getRouteKey(method: string, pathname: string): Route {
  const key = `${method}:${pathname}`;
  if (!(key in routeActionMapper)) {
    throw new Error(`Invalid route: ${key}`);
  }
  return key as Route;
}

function buildSystemActionsForCreation(
  systemActions: SystemAction[],
  userId: string,
  companyId: string, // We can be certain companyId was on user here
  result: $Enums.SystemActionResult,
): IBuildCreateUserSystemActionArgs[] {
  return systemActions.map((action) => ({
    userId,
    companyId,
    action,
    result,
  }));
}

export function buildErrorContextForLog(request: any): LogContext {
  const { method, url } = getRouteDetails(request);
  const { userId, companyId } = getUserDetails(request);
  return { method, url, userId, companyId };
}
