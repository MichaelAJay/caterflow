import { FastifyRequest } from 'fastify';

export type LoginRequest = UserFoundLoginRequest | UserNotFoundLoginRequest;

export interface UserFoundLoginRequest extends FastifyRequest {
  userFound: true;
  userId: string;
  userHasAccount: boolean;
  requiresEmailVerificationSync: boolean;
  externalEmailVerificationStatus: boolean;
}

export interface UserNotFoundLoginRequest extends FastifyRequest {
  userFound: false;
  user: {
    name: string;
    email: string;
    external_auth_uid: string;
    emailVerified: boolean;
  };
}
