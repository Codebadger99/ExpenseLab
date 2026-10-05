import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Register } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService) { }

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
            }
        })

        return user
    }

}
