import { FastifyRequest } from 'fastify';

export type LoginRequest = UserFoundLoginRequest | UserNotFoundLoginRequest;

export interface UserFoundLoginRequest extends FastifyRequest {
  userFound: true;
  userHasAccount: boolean;
}

export interface UserNotFoundLoginRequest extends FastifyRequest {
  userFound: false;
  user: {
    name: string;
    email: string;
    external_auth_uid: string;
  };
}