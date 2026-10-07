import { IsDate, IsDateString, IsEnum, IsNumber, IsOptional, Matches, MaxLength } from "class-validator";
import { TransactionType, Category, Desire, PaymentMethod } from "../../generated/client/enums";

export class createTransaction{
    @IsOptional()
    @IsEnum(TransactionType)
    type?: TransactionType 

    @IsOptional()
    @Matches(/^(?!0+(\.0+)?$)\d{1,12}(\.\d{1,2})?$/, {
    message: 'amount must be above zero with at most 2 decimal places',
  })
    amount: string;

    @IsOptional()
    @IsDateString()
    date?: string;

    @IsOptional()
    @IsEnum(Category)
    category?: Category;

    @IsOptional()
    @MaxLength(80)
    merchant?: string;

    @IsOptional()
    @IsEnum(Desire)
    desire?: Desire;

    @IsOptional()
    @IsEnum(PaymentMethod)
    payment?: PaymentMethod;
}