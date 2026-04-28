import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
	@IsOptional()
	@IsString()
	avatar?: string;

	@IsOptional()
	@IsString()
	bio?: string;

	@IsOptional()
	@IsString()
	status?: string;

	@IsOptional()
	@IsString()
	password?: string;

	@IsOptional()
	@IsString()
	position?: string;

	@IsOptional()
	@IsString()
	department?: string;

	@IsOptional()
	@IsString()
	currentProject?: string;
}





