import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { BudgetService } from './budget.service';
import { UpdatedBudget } from './dto/update-budget.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('budget')
export class BudgetController {
  constructor(
    private readonly budgetService: BudgetService,
  ) {}

  // GET /budget
  @Get()
  allBudget(
    @Req() req: { user: { id: number } },
  ) {
    return this.budgetService.readAllBudget(
      req.user.id,
    );
  }

  // PATCH /budget
  @Patch()
  updateBudget(
    @Req() req: { user: { id: number } },
    @Body() updated: UpdatedBudget,
  ) {
    return this.budgetService.updateBudget(
      req.user.id,
      updated,
    );
  }
}