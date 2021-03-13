import { FastifyReply, FastifyRequest } from 'fastify';
import { Tenant } from 'src/tenants/models/tenant.entity';
import { User } from 'src/users/models/user.entity';

export interface Reply extends FastifyReply{
  view(page: string, data?: object): FastifyReply
}

export interface Request extends FastifyRequest{
  user: User //we need this for Typescript to recognize the presence of user in our request object to be sent to login.
}

export type TenantsWithCount = {
  tenants: Tenant[],
  count?: number
}

export enum Gender {
  M = "male",
  F = "female"
}

export enum TenantStatus {
  A = "active",
  S = "suspended",
  O = "owing"
}

export interface AuthTokenPayload {
  username: string;
  sub: {
    id: number ,
    firstName: string,
    lastName: string,
    landlord: boolean,
    roles: string[]
  }
}

