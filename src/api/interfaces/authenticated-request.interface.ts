import { FastifyRequest } from 'fastify';
export interface AuthenticatedRequest extends FastifyRequest {
  user: {
    external_auth_uid: string;
    email: string;
    accountId?: string;
  };
}
