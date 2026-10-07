import { IsDefined, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateGoal{

    @IsString()
    @IsOptional()
    name: string;

    @IsNumber()
    @IsOptional()
    target: number;

    @IsNumber()
    saved: number
}