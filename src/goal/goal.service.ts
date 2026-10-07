import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGoal } from './dto/create-goal.dto';
import { addedMoney } from './dto/add-goal-money.dto';

@Injectable()
export class GoalService {
    constructor(private readonly prisma: PrismaService) { }

    async getAllGoal() {
        const allGoals = await this.prisma.goal.findMany()

        return allGoals
    }

    async getOneGoal(id: number, userId: number) {
        const updateGoal = await this.prisma.goal.findFirst({
            where: {
                id,
                userId
            }
        })

        return updateGoal
    }

    async createGoal(create: CreateGoal, userId: number) {
        const createGoal = await this.prisma.goal.create({
            data: {
                name: create.name,
                target: create.target,
                saved: create.saved ?? 0,
                userId
            }
        })
        return createGoal

    }

    async updateGoal(id: number, userId: number, update: addedMoney) {
        const updateGoal = this.prisma.goal.update({
            where: {
                id,
                userId
            },

            data: {
                ...update
            }
        })

        return updateGoal
    }

    async deleteGoal(id: number, userId: number) {
        const deleteGoal = this.prisma.goal.delete({
            where: {
                id,
                userId
            }
        })

        return deleteGoal
    }
}
