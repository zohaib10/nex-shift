import {
  Injectable,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import type { User } from '@prisma/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { EmailService } from '../email/email.service';
import { verificationCodeEmail } from '../email/templates/verification-code.email';
import { passwordResetEmail } from '../email/templates/password-reset.email';
import { SignupDto } from './dto/signup.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';

const CODE_TTL_MS = 15 * 60 * 1000;
const CODE_MAX_ATTEMPTS = 5;
const CODE_RESEND_COOLDOWN_MS = 60 * 1000;
const CODE_MAX_PER_DAY = 5;
const TEST_MODE_CODE = '123456';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private supabase: SupabaseService,
    private email: EmailService,
  ) {}

  async signup(dto: SignupDto) {
    const email = dto.email.toLowerCase();

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    // Created unconfirmed: Supabase won't issue a password session or link a
    // Google login to this account until the email code is verified.
    let supabaseUser;
    try {
      supabaseUser = await this.supabase.createUser(email, dto.password);
    } catch (error) {
      console.error('Supabase signup error:', error);
      const message = error instanceof Error ? error.message : '';
      if (message.includes('already been registered')) {
        throw new ConflictException('A user with this email already exists');
      }
      throw new InternalServerErrorException(
        message || 'Failed to create authentication account',
      );
    }

    const user = await this.prisma.user.create({
      data: {
        supabaseId: supabaseUser.id,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email,
        phoneNumber: dto.phoneNumber,
        emailVerified: false,
        phoneVerified: false,
      },
    });

    await this.issueVerificationCode(user);
    return this.toProfile(user);
  }

  toProfile(user: User) {
    return {
      id: user.id,
      supabaseId: user.supabaseId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      createdAt: user.createdAt,
      hiddenDashboardCards: user.hiddenDashboardCards,
    };
  }

  async updatePreferences(user: User, dto: UpdatePreferencesDto) {
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        ...(dto.hiddenDashboardCards
          ? { hiddenDashboardCards: [...new Set(dto.hiddenDashboardCards)] }
          : {}),
      },
    });
    return this.toProfile(updated);
  }

  // ─── email verification ─────────────────────────────────────────────────

  private hashCode(userId: string, code: string) {
    return crypto
      .createHash('sha256')
      .update(`${userId}:${code}`)
      .digest('hex');
  }

  private async issueVerificationCode(user: User) {
    const code = this.email.testMode
      ? TEST_MODE_CODE
      : crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');

    await this.prisma.$transaction([
      this.prisma.emailVerificationCode.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      }),
      this.prisma.emailVerificationCode.create({
        data: {
          userId: user.id,
          codeHash: this.hashCode(user.id, code),
          expiresAt: new Date(Date.now() + CODE_TTL_MS),
        },
      }),
    ]);

    await this.email.send({
      to: user.email,
      ...verificationCodeEmail({ firstName: user.firstName, code }),
    });
  }

  /**
   * Always reports success so the endpoint can't be used to find out which
   * emails have accounts. Quietly skips sending during the cooldown or past
   * the daily limit.
   */
  async resendVerification(rawEmail: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: rawEmail.toLowerCase() },
    });
    if (!user || user.emailVerified) return { success: true };

    const recent = await this.prisma.emailVerificationCode.findMany({
      where: {
        userId: user.id,
        createdAt: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });
    const inCooldown =
      recent[0] &&
      Date.now() - recent[0].createdAt.getTime() < CODE_RESEND_COOLDOWN_MS;
    if (inCooldown || recent.length >= CODE_MAX_PER_DAY)
      return { success: true };

    await this.issueVerificationCode(user);
    return { success: true };
  }

  /**
   * Checks the code, marks the email verified (here and in Supabase), and
   * returns a one-time token the client exchanges for a session with
   * supabase.auth.verifyOtp — so the user is logged in straight away.
   */
  async verifyEmail(rawEmail: string, code: string) {
    const invalid = new BadRequestException(
      'That code is incorrect or has expired. Request a new one.',
    );

    const user = await this.prisma.user.findUnique({
      where: { email: rawEmail.toLowerCase() },
    });
    if (!user || user.emailVerified) throw invalid;

    const record = await this.prisma.emailVerificationCode.findFirst({
      where: { userId: user.id, usedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    if (
      !record ||
      record.expiresAt < new Date() ||
      record.attempts >= CODE_MAX_ATTEMPTS
    ) {
      throw invalid;
    }

    const expected = Buffer.from(record.codeHash, 'hex');
    const actual = Buffer.from(this.hashCode(user.id, code), 'hex');
    if (!crypto.timingSafeEqual(expected, actual)) {
      const attempts = record.attempts + 1;
      await this.prisma.emailVerificationCode.update({
        where: { id: record.id },
        data: {
          attempts,
          ...(attempts >= CODE_MAX_ATTEMPTS ? { usedAt: new Date() } : {}),
        },
      });
      throw invalid;
    }

    const admin = this.supabase.getClient().auth.admin;
    const { error: confirmError } = await admin.updateUserById(
      user.supabaseId,
      { email_confirm: true },
    );
    if (confirmError) {
      console.error('Supabase email confirm error:', confirmError);
      throw new InternalServerErrorException(
        'Could not verify your email. Please try again.',
      );
    }

    await this.prisma.$transaction([
      this.prisma.emailVerificationCode.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      }),
    ]);

    // generateLink only builds the link; it doesn't send an email.
    const { data, error } = await admin.generateLink({
      type: 'magiclink',
      email: user.email,
    });
    if (error || !data.properties?.hashed_token) {
      console.error('Supabase generateLink error:', error);
      // Verified, but no auto-login: the client sends them to log in instead.
      return { verified: true, tokenHash: null };
    }
    return { verified: true, tokenHash: data.properties.hashed_token };
  }

  // ─── password reset ─────────────────────────────────────────────────────

  async forgotPassword(rawEmail: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: rawEmail.toLowerCase() },
    });

    if (!user) {
      // Silent success — protects against user-enumeration attacks
      return { success: true };
    }

    // Invalidate any existing unused tokens for this user
    await this.prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    const token = crypto.randomBytes(32).toString('hex');
    await this.prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      },
    });

    try {
      await this.email.send({
        to: user.email,
        ...passwordResetEmail({ firstName: user.firstName, token }),
      });
    } catch (e) {
      console.error('Failed to send reset email:', e);
      throw new InternalServerErrorException('Failed to send reset email');
    }

    return { success: true };
  }

  async resetPassword(token: string, newPassword: string) {
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      throw new UnauthorizedException('Invalid or expired reset link.');
    }
    if (resetToken.usedAt) {
      throw new UnauthorizedException('This reset link has already been used.');
    }
    if (new Date() > resetToken.expiresAt) {
      throw new UnauthorizedException(
        'This reset link has expired. Please request a new one.',
      );
    }

    // Using the emailed link proves they own the inbox, so this also verifies the email.
    const { error } = await this.supabase
      .getClient()
      .auth.admin.updateUserById(resetToken.user.supabaseId, {
        password: newPassword,
        email_confirm: true,
      });

    if (error) {
      console.error('Supabase password update error:', error);
      throw new InternalServerErrorException(
        'Failed to update password. Please try again.',
      );
    }

    await this.prisma.$transaction([
      this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.user.update({
        where: { id: resetToken.userId },
        data: { emailVerified: true },
      }),
    ]);

    return { success: true };
  }

  // ─── session sync ───────────────────────────────────────────────────────

  /**
   * Identity comes only from the verified access token, never the request body.
   * Supabase links a Google identity to an existing auth user with the same
   * verified email, so an existing account keeps its supabaseId; we never link
   * DB rows by email here.
   */
  async sync(supabaseUser: SupabaseUser) {
    const existing = await this.prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
    });
    if (existing) return this.toProfile(existing);

    const email = supabaseUser.email?.toLowerCase();
    if (!email || !supabaseUser.email_confirmed_at) {
      throw new UnauthorizedException('A verified email is required');
    }

    const emailTaken = await this.prisma.user.findUnique({ where: { email } });
    if (emailTaken) {
      throw new ConflictException('An account with this email already exists');
    }

    // What Google (via Supabase) puts in user_metadata; every field is optional.
    const meta = (supabaseUser.user_metadata ?? {}) as {
      full_name?: string;
      name?: string;
      given_name?: string;
      family_name?: string;
    };
    const names: string[] = (meta.full_name ?? meta.name ?? '')
      .split(' ')
      .filter(Boolean);
    const user = await this.prisma.user.create({
      data: {
        supabaseId: supabaseUser.id,
        email,
        firstName: meta.given_name || names[0] || 'User',
        lastName: meta.family_name || names.slice(1).join(' '),
        phoneNumber: '',
        emailVerified: true,
        phoneVerified: false,
      },
    });
    return this.toProfile(user);
  }
}
