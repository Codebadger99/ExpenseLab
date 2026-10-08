import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createTransaction } from './dto/create-transaction.dto';
import { TransactionType } from '../generated/client/enums';
import { UpdateTransaction } from './dto/update-transaction.dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class TransactionService {
    constructor(private prisma: PrismaService, private readonly notificationService: NotificationService) { }

    async readAllTransaction(userId: number) {
        const allTransaction = await this.prisma.transaction.findMany({
            where: { userId },
            orderBy: { date: 'desc' }
        })

        if (!allTransaction) throw new NotFoundException('Empty Transaction')

        return allTransaction
    }

    async readOneTransaction(id: number, userId: number) {
        const findOneTransaction = await this.prisma.transaction.findUnique({
            where: {
                id: id,
                userId
            }
        })

        if (!findOneTransaction) throw new NotFoundException('Transactions not found')

        return findOneTransaction
    }

    async createTransaction(create: createTransaction, userId: number) {
        const type = create.type ?? TransactionType.EXPENSE

        if (type === TransactionType.EXPENSE && !create.category) {
            throw new BadRequestException('Expenses need a category');
        }
        if (create.type === 'INCOME' && !create.incomeSource) {
            throw new BadRequestException('Income source is required for income');
        }

        if (create.type === 'EXPENSE' && create.incomeSource) {
            throw new BadRequestException(
                'Income source cannot be used for expenses',
            );
        }

        if (create.type === 'INCOME' && create.category) {
            throw new BadRequestException(
                'Category cannot be used for income',
            );
        }

        const createTransaction = await this.prisma.transaction.create({
            data: {
                type,
                amount: create.amount,
                date: create.date ? new Date(create.date) : undefined,
                category: create.category,
                merchant: create.merchant,
                payment: create.payment,
                desire: create.desire,
                userId
            }
        })

        await this.prisma.journal.create({
            data: {
                userId,
                transactionId: createTransaction.id
            }
        })
        if (
            createTransaction.type === TransactionType.EXPENSE &&
            createTransaction.category
        ) {
            await this.notificationService.checkBudget(
                userId,
                createTransaction.category,
                createTransaction.date,
            );
        }
        return createTransaction
    }

    async updateTranscation(id: number, userId: number, update: UpdateTransaction) {
        const updateTransaction = await this.prisma.transaction.update({
            where: {
                id: id,
                userId
            },

            data: {
                ...update
            }
        })

        if (!updateTransaction) throw new NotFoundException('Transactions not found')

        return updateTransaction
    }

    async deleteTransaction(id: number, userId: number) {
        const deleteOne = await this.prisma.transaction.delete({
            where: {
                id: id,
                userId
            }
        })

        if (!deleteOne) throw new NotFoundException('You dont have any transaction to delete')

        return deleteOne
    }
}
