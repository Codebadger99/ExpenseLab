import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AnalyticsService } from './analytics.service';
import { MonthQueryDto } from './dto/month-query.dto';
import { TopMerchantsQueryDto } from './dto/top-merchants.dto';

type Req_ = { user: { id: number } };

@UseGuards(AuthGuard('jwt'))
@Controller('analytics')
export class AnalyticsController {
  constructor(private analytics: AnalyticsService) {}

  // Dashboard
  @Get('overview')
  overview(@Req() req: Req_, @Query() q: MonthQueryDto) {
    return this.analytics.overview(req.user.id, q.month);
  }

  @Get('categories')
  categories(@Req() req: Req_, @Query() q: MonthQueryDto) {
    return this.analytics.categories(req.user.id, q.month);
  }

  @Get('trends')
  trends(@Req() req: Req_, @Query() q: MonthQueryDto) {
    return this.analytics.trends(req.user.id, q.month);
  }

  // Insights
  @Get('statistics')
  statistics(@Req() req: Req_, @Query() q: MonthQueryDto) {
    return this.analytics.statistics(req.user.id, q.month);
  }

  @Get('needs-wants')
  needsWants(@Req() req: Req_, @Query() q: MonthQueryDto) {
    return this.analytics.needsWants(req.user.id, q.month);
  }

  @Get('payment-methods')
  paymentMethods(@Req() req: Req_, @Query() q: MonthQueryDto) {
    return this.analytics.paymentMethods(req.user.id, q.month);
  }

  @Get('merchants/top')
  topMerchants(@Req() req: Req_, @Query() q: TopMerchantsQueryDto) {
    return this.analytics.topMerchants(req.user.id, q.month, q.limit);
  }

  @Get('insights')
  insights(@Req() req: Req_, @Query() q: MonthQueryDto) {
    return this.analytics.insights(req.user.id, q.month);
  }
}