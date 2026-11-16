import type { EmailContent } from '../email.service';
import { emailLayout, escapeHtml } from './layout';

export function verificationCodeEmail({
  firstName,
  code,
}: {
  firstName: string;
  code: string;
}): EmailContent {
  return {
    subject: `${code} is your NexShift verification code`,
    text: `Hi ${firstName},\n\nYour NexShift verification code is ${code}. It expires in 15 minutes.\n\nIf you didn't sign up for NexShift, you can ignore this email.`,
    html: emailLayout(`
      <h1 style="color: #07090E; margin-bottom: 24px;">Verify your email</h1>
      <p>Hi ${escapeHtml(firstName)},</p>
      <p>Enter this code in NexShift to finish creating your account:</p>
      <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 28px 0; color: #07090E;">${code}</p>
      <p style="color: #999; font-size: 13px;">This code expires in 15 minutes. If you didn't sign up for NexShift, you can ignore this email.</p>
    `),
  };
}
