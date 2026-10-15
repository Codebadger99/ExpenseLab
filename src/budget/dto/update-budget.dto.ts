import { IsEnum, IsInt, Min } from 'class-validator';
import { Category } from '../../generated/client/enums';

export class UpdatedBudget {
  @IsEnum(Category)
  category: Category;

  @IsInt()
  @Min(0)
  limit: number;
}