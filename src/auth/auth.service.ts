import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Register } from './dto/register.dto';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService){}

    Register(){
       
    }

}
