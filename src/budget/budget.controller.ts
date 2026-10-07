import { Body, Controller, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { AuthGuard } from '@nestjs/passport';
import { UpdatedBudget } from './dto/update-budget.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('budget')
export class BudgetController {
    constructor(private budgetService: BudgetService){}

    @Patch(':id')
    updatedBudget(@Param('id', ParseIntPipe) id: number, @Req() req: {user: {id: number}}, @Body() updated: UpdatedBudget){
     return this.budgetService.updateBudget(id, req.user.id, updated)
    }
}
