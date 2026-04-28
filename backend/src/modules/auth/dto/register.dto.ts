import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
	@ApiProperty({ example: 'user@example.com' })
	@IsEmail()
	email: string;

	@ApiProperty({ example: 'password123' })
	@IsString()
	@MinLength(6)
	password: string;

	@ApiProperty({ example: 'john_doe' })
	@IsString()
	username: string;

	@ApiProperty({ example: 'John' })
	@IsString()
	firstName: string;

	@ApiProperty({ example: 'Doe' })
	@IsString()
	lastName: string;
}






