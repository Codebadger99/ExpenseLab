import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Register } from './dto/register.dto';

import { Login } from './dto/login.dto'
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { randomInt } from 'crypto';
import { MailService } from '../mail/mail.service';


@Injectable()
export class AuthService {
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
                onboardingCompleted: true,
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
                onboardingCompleted: user.onboardingCompleted,
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
                email: user.email
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
        } catch (err) {
            console.error('Could not send reset email', err); 
        }
        return response
    }

}
