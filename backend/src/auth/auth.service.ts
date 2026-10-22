import { BadRequestException, ConflictException, ForbiddenException, Injectable, Logger, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Register } from './dto/register.dto';

import { Login } from './dto/login.dto'
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { randomInt } from 'crypto';
import { MailService } from '../mail/mail.service';
import { ResetPasswordDto } from './dto/reset-password.dto';


@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(private prisma: PrismaService, private jwt: JwtService, private mail: MailService) { }

    async Register(register: Register) {
        const exists = await this.prisma.user.findUnique({
            where: {
                email: register.email
            }
        })

        if (exists) throw new ConflictException("An account with this email already exists. Please log in.")

        const Hashedpassword = await bcrypt.hash(register.password, 10)

        const user = await this.prisma.user.create({
            data: {
                name: register.name,
                email: register.email,
                passwordHash: Hashedpassword,
            },
            select: {
                id: true,
                name: true,
                email: true,
                monthlyTrackAmount: true,
                createdAt: true,
                updatedAt: true,
            },
        })

        const accessToken = await this.jwt.signAsync({
            sub: user.id,
            email: user.email,
        })

        return {
            message: 'Registered successfully',
            accessToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                monthlyTrackAmount: user.monthlyTrackAmount,
            },
        }
    }

    async Login(login: Login) {
        const user = await this.prisma.user.findUnique({
            where: {
                email: login.email,
            }
        })

        if (!user) throw new UnauthorizedException("Incorrect email and password")

        const passwordCheck = await bcrypt.compare(login.password, user.passwordHash)

        if (!passwordCheck) throw new UnauthorizedException("Incorrect email and password")

        const accessToken = await this.jwt.signAsync({
            sub: user.id,
            email: user.email
        })

        return {
            message: "Logged in Successfully",
            accessToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                monthlyTrackAmount: user.monthlyTrackAmount,
            },
        }
    }

    async checkMail(email: string) {
        const existing = await this.prisma.user.findUnique({
            where: { email },
            select: { id: true }
        })
        return { exists: !!existing }
    }

    async forgotPassword(email: string) {
        const response = "If that email is registered, a reset code has been sent."
        const user = await this.prisma.user.findUnique({ where: { email } })
        if (!user) return response


        const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
        const codeHash = await bcrypt.hash(code, 10);

        await this.prisma.$transaction([
            this.prisma.passwordReset.deleteMany({ where: { userId: user.id } }),
            this.prisma.passwordReset.create({
                data: { userId: user.id, codeHash, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
            }),
        ]);

        try {
            await this.mail.sendResetCode(user.email, code);
        } catch (error) {
            this.logger.error(
                'Password reset email delivery failed',
                error instanceof Error ? error.stack : undefined,
            );
            throw new ServiceUnavailableException(
                'We couldn’t send your password reset email right now. Please try again later.',
            );
        }
        return response
    }

    
async resetPassword(dto: ResetPasswordDto) {
  const invalid = new BadRequestException(
    'Invalid or expired reset code',
  );

  const user = await this.prisma.user.findUnique({
    where: { email: dto.email },
    select: { id: true },
  });

  if (!user) {
    throw invalid;
  }

  const reset = await this.prisma.passwordReset.findFirst({
    where: {
      userId: user.id,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!reset || reset.attempts >= 5) {
    throw invalid;
  }

  const codeIsValid = await bcrypt.compare(
    dto.code,
    reset.codeHash,
  );

  if (!codeIsValid) {
    await this.prisma.passwordReset.update({
      where: { id: reset.id },
      data: { attempts: { increment: 1 } },
    });

    throw invalid;
  }

  const passwordHash = await bcrypt.hash(dto.newPassword, 10);

  await this.prisma.$transaction([
    this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    }),

    this.prisma.passwordReset.deleteMany({
      where: { userId: user.id },
    }),
  ]);

  return {
    message: 'Password updated successfully. You can now log in.',
  };
}



async deleteAccount(userId: number) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw new UnauthorizedException('User account not found');
  }

  await this.prisma.user.delete({
    where: { id: userId },
  });

  return {
    message: 'Your account and associated data have been deleted.',
  };
}


}
