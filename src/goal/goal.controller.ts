import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { GoalService } from './goal.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateGoal } from './dto/create-goal.dto';
import { addedMoney } from './dto/add-goal-money.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('goal')
export class GoalController {
    constructor(private goalService: GoalService) { }

    @Get()
    getAll() {
        return this.goalService.getAllGoal()
    }

    @Get(':id')
    getOne(@Param('id', ParseIntPipe) id: number, @Req() req: { user: { id: number } }) {
        return this.goalService.getOneGoal(id, req.user.id)
    }

    @Post()
    create(@Body() create: CreateGoal, @Req() req: { user: { id: number } }) {
        return this.goalService.createGoal(create, req.user.id)
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Req() req: { user: { id: number } }, @Body() update: addedMoney) {
        return this.goalService.updateGoal(id, req.user.id, update)
    }

    @Delete(':id')
    delete(@Param('id', ParseIntPipe) id: number, @Req() req: { user: { id: number } }) {
        return this.goalService.deleteGoal(id, req.user.id)
    }

}
