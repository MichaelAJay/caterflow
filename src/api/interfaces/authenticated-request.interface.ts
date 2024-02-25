import { FastifyRequest } from 'fastify';
export interface AuthenticatedRequest extends FastifyRequest {
  user: {
    id: string;
    external_auth_uid: string;
    email: string;
    accountId?: string;
  };
}
