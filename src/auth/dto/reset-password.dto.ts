
import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ResetPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^\d{6}$/, {
    message: 'Reset code must contain exactly 6 digits',
  })
  code: string;

  @IsString()
  @MinLength(8, {
    message: 'Password must be at least 8 characters long',
  })
  @MaxLength(128, {
    message: 'Password cannot exceed 128 characters',
  })
  newPassword: string;
}
