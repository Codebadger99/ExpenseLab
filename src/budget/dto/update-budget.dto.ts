import { IsEnum, IsNumber, IsOptional } from "class-validator";
import { Category } from "../../generated/client/enums";

export class UpdatedBudget {
    @IsEnum(Category)
    @IsOptional()
    category?: Category


    @IsOptional()
    @IsNumber()
    limit: number
}