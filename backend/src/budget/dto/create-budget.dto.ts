import { IsEnum, IsNumber, Min } from 'class-validator';
import { Category } from '../../generated/client/enums';

export class CreateBudget {
  @IsEnum(Category)
  category: Category;

  @IsNumber()
  @Min(0)
  limit: number;
}