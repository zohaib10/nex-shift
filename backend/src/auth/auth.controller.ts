import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto, ResendVerificationDto } from './dto/verify-email.dto';
import {
  AllowUnsynced,
  AllowUnverified,
  CurrentSupabaseUser,
  CurrentUser,
  Public,
} from './auth.decorators';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('signup')
  async signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.email, dto.code);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('resend-verification')
  async resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerification(dto.email);
  }

  /**
   * Called by the web app right after any Supabase sign-in (password or OAuth).
   * Returns our profile for the token's user, creating it on first OAuth login.
   */
  @AllowUnsynced()
  @AllowUnverified()
  @HttpCode(HttpStatus.OK)
  @Post('sync')
  async sync(@CurrentSupabaseUser() supabaseUser: SupabaseUser) {
    return this.authService.sync(supabaseUser);
  }

  @AllowUnverified()
  @Get('me')
  me(@CurrentUser() user: User) {
    return this.authService.toProfile(user);
  }
}
