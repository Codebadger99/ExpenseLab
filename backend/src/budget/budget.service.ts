import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { Category } from '../generated/client/enums';
import { UpdatedBudget } from './dto/update-budget.dto';

@Injectable()
export class BudgetService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async readAllBudget(userId: number) {
    return this.prisma.budget.findMany({
      where: {
        userId,
      },
      orderBy: {
        category: 'asc',
      },
    });
  }


    async updateBudget(
    userId: number,
    updated: UpdatedBudget,
  ) {
    return this.prisma.budget.upsert({
      where: {
        userId_category: {
          userId,
          category: updated.category,
        },
      },

      update: {
        limit: updated.limit,
      },

      create: {
        userId,
        category: updated.category,
        limit: updated.limit,
      },
    });
  }
}