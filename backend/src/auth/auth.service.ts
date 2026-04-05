import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { SignupDto } from './dto/signup.dto';
import { Resend } from 'resend';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private supabase: SupabaseService,
  ) {}

  async signup(dto: SignupDto) {
    // 1. Check if user already exists in our DB
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    // 2. Create user in Supabase Auth
    let supabaseUser;
    try {
      supabaseUser = await this.supabase.createUser(dto.email, dto.password);
    } catch (error: any) {
      console.error('Supabase signup error:', error);
      if (error?.message?.includes('already been registered')) {
        throw new ConflictException('A user with this email already exists');
      }
      throw new InternalServerErrorException(
        error?.message || 'Failed to create authentication account',
      );
    }

    // 3. Create user record in our own database
    const user = await this.prisma.user.create({
      data: {
        supabaseId: supabaseUser.id,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phoneNumber: dto.phoneNumber,
        emailVerified: false,
        phoneVerified: false,
      },
    });

    // Return user data (without sensitive info)
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
    };
  }

  async login(dto: { email: string; password: string }) {
    // 1. Authenticate with Supabase
    const { data, error } = await this.supabase.getClient().auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (error || !data.user) {
      console.error('Supabase login rejected:', error?.message || 'Unknown error', 'Data:', data);
      throw new (require('@nestjs/common').UnauthorizedException)(
        'Invalid email or password',
      );
    }

    // 2. Feed the verified user from our own DB
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new (require('@nestjs/common').UnauthorizedException)(
        'User record not found. Please contact support.',
      );
    }

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
    };
  }

  async forgotPassword(email: string) {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.warn('RESEND_API_KEY is not configured in .env. Password reset email will NOT be sent.');
      return { success: true, warning: 'Emails are disabled — no RESEND_API_KEY in ENV' };
    }

    const resend = new Resend(resendApiKey);

    // 1. Verify user exists in our DB
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Silent success — protects against user-enumeration attacks
      return { success: true };
    }

    // 2. Invalidate any existing unused tokens for this user
    await this.prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    // 3. Generate a cryptographically secure token
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');

    // 4. Store the token with a 15-minute expiry
    await this.prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      },
    });

    // 5. Build the reset link
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    // 6. Send the email via Resend
    try {
      const { error } = await resend.emails.send({
        from: 'NexShift <onboarding@resend.dev>',
        to: email,
        subject: 'Reset your NexShift password',
        html: `
          <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 500px; margin: 0 auto; color: #333;">
            <h1 style="color: #07090E; margin-bottom: 24px;">Reset your password</h1>
            <p>Hi ${user.firstName},</p>
            <p>We received a request to reset your password for your NexShift account.</p>
            <p style="margin: 32px 0;">
              <a href="${resetLink}" style="background-color: #00D48A; color: #07090E; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
            </p>
            <p style="color: #999; font-size: 13px;">This link expires in 15 minutes. If you didn't request this, you can safely ignore this email.</p>
          </div>
        `,
      });

      if (error) {
        console.error('Resend email error:', error);
        throw new InternalServerErrorException('Failed to send reset email');
      }

      return { success: true };
    } catch (e) {
      console.error('Unexpected error sending reset email:', e);
      throw new InternalServerErrorException('Failed to send reset email');
    }
  }

  async resetPassword(token: string, newPassword: string) {
    // 1. Find the token record
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      throw new UnauthorizedException('Invalid or expired reset link.');
    }

    // 2. Check if already used
    if (resetToken.usedAt) {
      throw new UnauthorizedException('This reset link has already been used.');
    }

    // 3. Check if expired
    if (new Date() > resetToken.expiresAt) {
      throw new UnauthorizedException('This reset link has expired. Please request a new one.');
    }

    // 4. Update the password and auto-confirm email in Supabase using the admin API
    const { error } = await this.supabase.getClient().auth.admin.updateUserById(
      resetToken.user.supabaseId,
      {
        password: newPassword,
        email_confirm: true,
      },
    );

    if (error) {
      console.error('Supabase password update error:', error);
      throw new InternalServerErrorException('Failed to update password. Please try again.');
    }

    // 5. Mark the token as used
    await this.prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    });

    return { success: true };
  }

  async googleSync(dto: import('./dto/google-sync.dto').GoogleSyncDto) {
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { supabaseId: dto.supabaseId },
          { email: dto.email }
        ]
      }
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          supabaseId: dto.supabaseId,
          email: dto.email,
          firstName: dto.firstName || 'User',
          lastName: dto.lastName || '',
          phoneNumber: '',
          phoneVerified: false,
          emailVerified: true
        }
      });
    } else if (!user.supabaseId) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { supabaseId: dto.supabaseId, emailVerified: true }
      });
    }

    return {
      id: user.id,
      supabaseId: user.supabaseId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    };
  }
}
