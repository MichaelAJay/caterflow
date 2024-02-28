import { FastifyRequest } from 'fastify';

export interface AuthenticatedRequestForNewUser extends FastifyRequest {
  user: {
    name: string;
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
