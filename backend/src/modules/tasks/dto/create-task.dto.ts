import { IsString, IsOptional, IsArray, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
	@ApiProperty()
	@IsString()
	title: string;

	@ApiProperty({ required: false })
	@IsOptional()
	@IsString()
	description?: string;

	@ApiProperty({ required: false })
	@IsOptional()
	@IsString()
	hashtag?: string;

	@ApiProperty({ required: false })
	@IsOptional()
	@IsUUID('4')
	chatId?: string;

	@ApiProperty({ type: [String], required: false })
	@IsOptional()
	@IsArray()
	@IsUUID('4', { each: true })
	assigneeIds?: string[];

	@ApiProperty({ required: false })
	@IsOptional()
	@IsUUID('4')
	messageId?: string;

	@ApiProperty({ required: false })
	@IsOptional()
	@IsDateString()
	dueDate?: string;
}

