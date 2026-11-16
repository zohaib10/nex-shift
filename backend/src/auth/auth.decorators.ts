import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { AuthedRequest } from './authed-request';

export const IS_PUBLIC_KEY = 'isPublic';
/** Route needs no access token. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const ALLOW_UNSYNCED_KEY = 'allowUnsynced';
/**
 * Route needs a valid access token but not an existing row in our `users`
 * table (e.g. the endpoint that creates that row after a first Google login).
 */
export const AllowUnsynced = () => SetMetadata(ALLOW_UNSYNCED_KEY, true);

export const ALLOW_UNVERIFIED_KEY = 'allowUnverified';
/** Route is usable before the user has verified their email. */
export const AllowUnverified = () => SetMetadata(ALLOW_UNVERIFIED_KEY, true);

/** Our own DB user for the verified access token. */
export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): User =>
    // AuthGuard rejects the request before this runs if there's no user
    // (except on @AllowUnsynced routes, which use CurrentSupabaseUser).
    ctx.switchToHttp().getRequest<AuthedRequest>().user!,
);

/** The Supabase auth user the access token was issued to. */
export const CurrentSupabaseUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): SupabaseUser =>
    ctx.switchToHttp().getRequest<AuthedRequest>().supabaseUser!,
);
