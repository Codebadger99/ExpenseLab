import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Register } from './dto/register.dto';

import { Login } from './dto/login.dto'
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService, private jwt: JwtService) { }

    async Register(register: Register) {
        const exists = await this.prisma.user.findUnique({
            where: {
                email: register.email
            }
        })

        if (exists) throw new ConflictException("Email already exists")

        const Hashedpassword = await bcrypt.hash(register.password, 10)

        const user = this.prisma.user.create({
            data: {
                name: register.name,
                email: register.email,
                passwordHash: Hashedpassword
            },

            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            },
        })

        return user
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
            accessToken
        }
    }

}
