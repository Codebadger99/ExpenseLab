import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { Worth } from "../../generated/client/enums";

export class createdJournal{

    @IsNumber()
    transactionId: number;

    @IsOptional()
    @IsString()
    why: string;

    @IsEnum(Worth)
    @IsOptional()
    worth: Worth

    @IsOptional()
    @IsString()
    reflection: string
}