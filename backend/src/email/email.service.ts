import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/** Escape text before putting it into email HTML. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

type Transport = 'ses' | 'smtp' | 'log';

/**
 * EMAIL_TRANSPORT picks how email goes out:
 *   ses  — Amazon SES (needs AWS_REGION + AWS credentials)
 *   smtp — any SMTP server: Mailpit/MailHog locally, Gmail, etc.
 *   log  — print to the console, send nothing (default)
 *
 * EMAIL_TEST_MODE=true only makes verification codes always 123456.
 * It's refused in production.
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transport: Transport;
  private readonly ses?: SESv2Client;
  private readonly smtp?: nodemailer.Transporter;
  private readonly from: string;
  readonly testMode: boolean;

  constructor(config: ConfigService) {
    const isProduction = config.get('NODE_ENV') === 'production';
    this.testMode = config.get('EMAIL_TEST_MODE') === 'true';
    if (this.testMode && isProduction) {
      throw new Error(
        'EMAIL_TEST_MODE must not be enabled when NODE_ENV=production',
      );
    }

    this.from = config.get('EMAIL_FROM') ?? 'NexShift <no-reply@localhost>';
    this.transport = (config.get<string>('EMAIL_TRANSPORT') ??
      'log') as Transport;

    if (this.transport === 'ses') {
      const region = config.get<string>('AWS_REGION');
      if (!region) throw new Error('EMAIL_TRANSPORT=ses requires AWS_REGION');
      // Credentials come from the default AWS chain (env vars, profile, or role).
      this.ses = new SESv2Client({ region });
    } else if (this.transport === 'smtp') {
      const host = config.get<string>('SMTP_HOST');
      if (!host) throw new Error('EMAIL_TRANSPORT=smtp requires SMTP_HOST');
      const port = Number(config.get('SMTP_PORT') ?? 587);
      const user = config.get<string>('SMTP_USER');
      this.smtp = nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // 465 = TLS from the start; 587/1025 = plain or STARTTLS
        auth: user ? { user, pass: config.get<string>('SMTP_PASS') } : undefined,
      });
    } else if (this.transport !== 'log') {
      throw new Error(
        `Unknown EMAIL_TRANSPORT "${this.transport}" (use ses, smtp or log)`,
      );
    }

    if (
      isProduction &&
      (this.transport === 'log' || !config.get('EMAIL_FROM'))
    ) {
      throw new Error(
        'Production needs EMAIL_TRANSPORT=ses or smtp, and EMAIL_FROM',
      );
    }

    this.logger.log(
      `Email transport: ${this.transport}${this.testMode ? ' (test mode: code is 123456)' : ''}`,
    );
  }

  async send(message: EmailMessage): Promise<void> {
    if (this.smtp) {
      await this.smtp.sendMail({ from: this.from, ...message });
      return;
    }

    if (this.ses) {
      await this.ses.send(
        new SendEmailCommand({
          FromEmailAddress: this.from,
          Destination: { ToAddresses: [message.to] },
          Content: {
            Simple: {
              Subject: { Data: message.subject, Charset: 'UTF-8' },
              Body: {
                Html: { Data: message.html, Charset: 'UTF-8' },
                Text: { Data: message.text, Charset: 'UTF-8' },
              },
            },
          },
        }),
      );
      return;
    }

    this.logger.log(
      `[email not sent] to=${message.to} subject="${message.subject}"\n${message.text}`,
    );
  }
}
