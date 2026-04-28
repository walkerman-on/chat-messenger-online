import { IsEmail, IsString, IsOptional, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
	@ApiProperty({ example: 'user@example.com' })
	@IsEmail()
	email: string;

	@ApiProperty({ example: 'password123' })
	@IsString()
	password: string;

	@ApiProperty({ example: '123456', required: false })
	@IsOptional()
	@IsString()
	@Length(6, 6)
	twoFactorCode?: string;
}





