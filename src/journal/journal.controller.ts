import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JournalService } from './journal.service';
import { UpdatedJournal } from './dto/update-journal.dto';
import { createdJournal } from './dto/create-journal.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('journal')
export class JournalController {
    constructor(private journal: JournalService) { }
    @Get()
    findAll(@Req() req: { user: { id: number } }) {
        return this.journal.findAllJournal(req.user.id)
    }

    @Post()
    createJournal(@Body() create: createdJournal, @Req() req: { user: { id: number } }) {
        return this.journal.createJournalForm(create, req.user.id)
    }

    @Patch(":id")
    updateJournal(@Param('id', ParseIntPipe) id: number, @Req() req: { user: { id: number } }, @Body() update: UpdatedJournal) {
        return this.journal.updatedJournalForm(id, req.user.id, update)

    }
}
