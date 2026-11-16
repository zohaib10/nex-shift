import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { ALLOW_UNSYNCED_KEY, ALLOW_UNVERIFIED_KEY, IS_PUBLIC_KEY } from './auth.decorators';

/**
 * Global guard: every route requires `Authorization: Bearer <supabase access token>`
 * unless marked @Public(). Sets `req.supabaseUser` (verified Supabase user) and
 * `req.user` (our DB user, looked up by supabaseId).
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private supabase: SupabaseService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const targets = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, targets)) return true;

    const req = context.switchToHttp().getRequest();
    const [scheme, token] = (req.headers.authorization ?? '').split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Missing access token');
    }

    // Verifies signature + expiry with Supabase and returns the auth user.
    const { data, error } = await this.supabase.getClient().auth.getUser(token);
    if (error || !data.user) {
      throw new UnauthorizedException('Invalid or expired access token');
    }
    req.supabaseUser = data.user;

    const user = await this.prisma.user.findUnique({ where: { supabaseId: data.user.id } });
    if (!user || user.deletedAt) {
      if (this.reflector.getAllAndOverride<boolean>(ALLOW_UNSYNCED_KEY, targets)) return true;
      throw new UnauthorizedException('Account not found');
    }
    req.user = user;

    if (!user.emailVerified && !this.reflector.getAllAndOverride<boolean>(ALLOW_UNVERIFIED_KEY, targets)) {
      // The web app watches for this code and sends the user to /verify-email.
      throw new ForbiddenException({ code: 'EMAIL_NOT_VERIFIED', message: 'Verify your email to continue' });
    }
    return true;
  }
}
