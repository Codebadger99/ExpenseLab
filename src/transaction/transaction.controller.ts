import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Delete, UseGuards, Req } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { createTransaction } from './dto/create-transaction.dto';
import { UpdateTransaction } from './dto/update-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('transaction')
export class TransactionController {
    constructor(private transaction: TransactionService) { }

    @Get()
    getAll(@Req() req: {user: {id: number}}) {
        return this.transaction.readAllTransaction(req.user.id)
    }

    @Get(':id')
    getOne(@Param('id', ParseIntPipe) id: number, @Req() req: {user: {id: number}}) {
        return this.transaction.readOneTransaction(id, req.user.id)
    }

    @Post()
    createTransactions(@Req() req: {user: {id: number}}, @Body() create: createTransaction) {
        return this.transaction.createTransaction(create, req.user.id)
    }

    @Patch(':id')
    updateTransactions(@Param('id', ParseIntPipe) id: number, @Body() update: UpdateTransaction, @Req() req: {user: {id: number}}) {
        return this.transaction.updateTranscation(id, req.user.id, update)
    }

    @Delete(':id')
    deleteTransactions(@Param('id', ParseIntPipe) id: number, @Req() req: {user: {id: number}}) {
        return this.transaction.deleteTransaction(id, req.user.id)
    }
}
