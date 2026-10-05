import { IsDate, IsEmail, IsNumber, IsString, MaxLength, MinLength } from "class-validator"

export class Login {
    @IsString()
    @IsEmail()
    @MinLength(6)
    email: string

    @IsString()
    @MaxLength(12)
    @MinLength(6)
    password: string
}