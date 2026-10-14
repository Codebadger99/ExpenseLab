import { IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";
import { Worth } from "../../generated/client/enums";

export class createdJournal{

    @IsInt()
    @Min(1)
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