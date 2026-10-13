
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter | null;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    const port = Number(this.config.get<string>('SMTP_PORT') ?? 587);
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
      });
    } else {
      this.transporter = null;
    }
  }

  async sendResetCode(email: string, code: string): Promise<void> {
    if (!this.transporter) {
      if (this.config.get<string>('NODE_ENV') === 'production') {
        throw new Error('SMTP is not configured');
      }

      this.logger.warn(
        `[DEV ONLY] Password reset code for ${email}: ${code}`,
      );
      return;
    }

    const from =
      this.config.get<string>('MAIL_FROM') ?? 'ExpenseLab <no-reply@example.com>';

    await this.transporter.sendMail({
      from,
      to: email,
      subject: 'Your ExpenseLab password reset code',
      text: [
        'Hello,',
        '',
        `Your ExpenseLab password reset code is: ${code}`,
        '',
        'This code expires in 10 minutes.',
        'If you did not request a password reset, you can ignore this email.',
      ].join('\n'),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto;">
          <h2>ExpenseLab</h2>
          <p>You requested to reset your password.</p>
          <p>Your password reset code is:</p>
          <div style="font-size: 30px; font-weight: bold;
                      letter-spacing: 8px; padding: 16px 0;">
            ${code}
          </div>
          <p>This code expires in <strong>10 minutes</strong>.</p>
          <p>If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    this.logger.log(`Password reset email sent to ${email}`);
  }
}
