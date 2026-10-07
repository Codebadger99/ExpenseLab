import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createdJournal } from './dto/create-journal.dto';
import { UpdatedJournal } from './dto/update-journal.dto';

@Injectable()
export class JournalService {
    constructor(private prisma: PrismaService){}
    async findAllJournal(){
        const findAll = await this.prisma.journal.findMany({
            include: {
                transaction: true
            }
        })

        return findAll
    }

    async createJournalForm(create: createdJournal, userId: number){
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
       const updated = await this.prisma.journal.update({
        where: {
            id,
            userId
        },

        data: { ...update, journalStatus: "WORTH_IT" }
       })

       return updated
    }
}
