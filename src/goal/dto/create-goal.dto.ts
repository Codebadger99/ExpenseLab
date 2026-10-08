import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateGoal {
    @IsString()
    name: string;

    @IsNumber()
    target: number;

    @IsNumber()
    @IsOptional()
    saved?: number;
}