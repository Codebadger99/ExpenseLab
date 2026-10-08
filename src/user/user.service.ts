import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        onboardingCompleted: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateOnboarding(userId: number, onboardingCompleted: boolean) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { onboardingCompleted },
      select: {
        onboardingCompleted: true,
      },
    });

    return user;
  }
}
