import { IsOptional, Matches } from 'class-validator';

export class MonthQueryDto {
  // Defaults to the current month when left out
  @IsOptional()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { message: 'month must look like 2026-10' })
  month?: string;
}