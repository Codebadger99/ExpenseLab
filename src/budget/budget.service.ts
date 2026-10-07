import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatedBudget } from './dto/update-budget.dto';

@Injectable()
export class BudgetService {
    constructor(private readonly prisma: PrismaService){}

    

    updateBudget(id: number, userId: number, updated: UpdatedBudget){
       const budgetUpdated = this.prisma.budget.update({
        where: {
            id: id,
            userId
        },

        data: {
            category: updated.category,
            limit: updated.limit,
            userId
        }
       })

       return budgetUpdated
    }
}
