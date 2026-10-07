import { IsEnum, IsOptional, IsString } from "class-validator";
import { Worth } from "../../generated/client/enums";

export class createdJournal{
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