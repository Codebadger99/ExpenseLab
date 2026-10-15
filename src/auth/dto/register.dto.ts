import { IsEmail, IsString, MaxLength, MinLength } from "class-validator"

export class Register {
    @IsString()
    name: string

    @IsString()
    @IsEmail()
    @MinLength(6)
    email: string

    @IsString()
    @MaxLength(128)
    @MinLength(8)
    password: string
}