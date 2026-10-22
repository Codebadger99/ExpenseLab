
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('SMTP_HOST'),
      port: Number(this.config.get<string>('SMTP_PORT', '465')),
      secure: this.config.get<string>('SMTP_SECURE') === 'true',
      auth: {
        user: this.config.get<string>('SMTP_USER'),
        pass: this.config.get<string>('SMTP_PASS'),
      },
    });
  }


  async sendResetCode(email: string, code: string) {
    return this.transporter.sendMail({
      from: {
        name: 'ExpenseLab',
        address: this.config.getOrThrow<string>('MAIL_FROM'),
      },
      to: email,
      subject: 'Your ExpenseLab password reset code',
      text: `Your password reset code is ${code}. It expires in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px;">
          <h2>Reset your ExpenseLab password</h2>
          <p>Use this code to reset your password:</p>
          <h1 style="letter-spacing: 6px;">${code}</h1>
          <p>This code expires in 10 minutes.</p>
          <p>If you did not request this, ignore this email.</p>
        </div>
      `,
    });
  }

  async testConnection() {
  await this.transporter.verify();
  return { message: 'SMTP connection successful' };
}
}
