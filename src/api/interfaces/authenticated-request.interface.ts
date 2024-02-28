import { FastifyRequest } from 'fastify';

export interface AuthenticatedRequestForNewUser extends FastifyRequest {
  user: {
    external_auth_uid: string;
    email: string;
  };
}

export interface AuthenticatedRequest extends FastifyRequest {
  user: {
    id: string;
    external_auth_uid: string;
    email: string;
    accountId: string | null;
  };
}
