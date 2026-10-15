import { IsEmail, IsString, MaxLength, MinLength } from "class-validator"

export class Login {
    @IsString()
    @IsEmail()
    @MinLength(6)
    email: string

    @IsString()
    @MaxLength(128)
    @MinLength(6)
    password: string
}