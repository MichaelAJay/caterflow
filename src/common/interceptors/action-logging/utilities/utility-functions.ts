import { SystemAction } from '@prisma/client';
import { IBuildCreateUserSystemActionArgs } from 'src/internal-modules/external-handlers/db-handlers/user-system-action-db-handler/interfaces/query-builder-args.interface';

// Routes should specify strings of form 'method:url' for each route that this interceptor services
type Route = 'TOP' | 'BOTTOM';
const routeActionMapper: Record<Route, SystemAction[]> = {
  TOP: ['AddIntegration'],
  BOTTOM: ['AddIntegration'],
};

export function buildSystemActionsForDB(
  request: any,
): IBuildCreateUserSystemActionArgs[] {
  const { method, url } = request.raw;

  // Also need to pull the user off the request

  if (!(typeof method === 'string' && typeof url === 'string')) {
    throw new Error('Request object could not parse method and url');
  }

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

  return buildSystemActionsForCreation(systemActions);
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
): IBuildCreateUserSystemActionArgs[] {
  // Map and construct details

  return [];
}

function constructDetails(systemAction) {}
