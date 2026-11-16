import type { EmailContent } from '../email.service';
import { emailButton, emailLayout, escapeHtml, frontendUrl } from './layout';

export function passwordResetEmail({
  firstName,
  token,
}: {
  firstName: string;
  token: string;
}): EmailContent {
  const resetLink = frontendUrl(`/reset-password?token=${token}`);
  return {
    subject: 'Reset your NexShift password',
    text: `Hi ${firstName},\n\nReset your NexShift password here: ${resetLink}\n\nThis link expires in 15 minutes. If you didn't request this, you can ignore this email.`,
    html: emailLayout(`
      <h1 style="color: #07090E; margin-bottom: 24px;">Reset your password</h1>
      <p>Hi ${escapeHtml(firstName)},</p>
      <p>We received a request to reset your password for your NexShift account.</p>
      ${emailButton(resetLink, 'Reset Password')}
      <p style="color: #999; font-size: 13px;">This link expires in 15 minutes. If you didn't request this, you can safely ignore this email.</p>
    `),
  };
}
