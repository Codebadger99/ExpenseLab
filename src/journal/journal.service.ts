import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createdJournal } from './dto/create-journal.dto';
import { UpdatedJournal } from './dto/update-journal.dto';

@Injectable()
export class JournalService {
    constructor(private prisma: PrismaService){}
    async findAllJournal(userId: number){
        const transactionsWithoutJournal = await this.prisma.transaction.findMany({
            where: {
                userId,
                type: 'EXPENSE',
                journal: { is: null },
            },
            select: { id: true },
        });

        if (transactionsWithoutJournal.length > 0) {
            await this.prisma.journal.createMany({
                data: transactionsWithoutJournal.map(({ id }) => ({
                    transactionId: id,
                    userId,
                })),
                skipDuplicates: true,
            });
        }

        const findAll = await this.prisma.journal.findMany({
            where: {
                userId,
                transaction: { type: 'EXPENSE' },
            },
            include: {
                transaction: true
            },
            orderBy: { createdAt: 'desc' },
        })

        return findAll
    }

    async createJournalForm(create: createdJournal, userId: number){
        const transaction = await this.prisma.transaction.findFirst({
            where: {
                id: create.transactionId,
                userId,
                type: 'EXPENSE',
            },
            select: { id: true },
        });

        if (!transaction) {
            throw new NotFoundException('Expense transaction not found');
        }

        const existingJournal = await this.prisma.journal.findUnique({
            where: { transactionId: transaction.id },
            select: { id: true },
        });

        if (existingJournal) {
            throw new ConflictException('A journal entry already exists for this expense');
        }

        const answer = await this.prisma.journal.create({
            data: {
                why: create.why,
                worth: create.worth,
                reflection: create.reflection,
                transactionId: create.transactionId,
                userId
            }
        })

        return answer
    }

    async updatedJournalForm(id: number, userId: number, update: UpdatedJournal){
         const existing = await this.prisma.journal.findFirst({
          where: { id, userId, transaction: { type: 'EXPENSE' } },
          select: { id: true },
         });

         if (!existing) {
          throw new NotFoundException('Journal entry not found');
         }

       const updated = await this.prisma.journal.update({
        where: {
            id,
            userId
        },

        data: {
            ...update,
            ...(update.worth ? { journalStatus: 'WORTH_IT' } : {}),
        }
       })

       return updated
    }
}
