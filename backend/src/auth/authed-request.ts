import type { Request } from 'express';
import type { User } from '@prisma/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

/** An Express request after AuthGuard has run. */
export interface AuthedRequest extends Request {
  /** Our DB user. Missing only on @AllowUnsynced routes before the first sync. */
  user?: User;
  /** The Supabase auth user the access token belongs to. */
  supabaseUser?: SupabaseUser;
}
