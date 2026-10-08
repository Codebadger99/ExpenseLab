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

  // Get all budgets belonging to the logged-in user
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

  // Update the limit of an existing default category
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