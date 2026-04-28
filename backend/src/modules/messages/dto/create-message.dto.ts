import { IsString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MessageType } from '../entities/message.entity';

export class CreateMessageDto {
	@ApiProperty({ enum: MessageType })
	@IsEnum(MessageType)
	type: MessageType;

	@ApiProperty({ required: false })
	@IsOptional()
	@IsString()
	content?: string;

	@ApiProperty({ required: false })
	@IsOptional()
	@IsString()
	fileUrl?: string;

	@ApiProperty({ required: false })
	@IsOptional()
	@IsUUID('4')
	forwardedFromId?: string;

	@ApiProperty()
	@IsUUID('4')
	chatId: string;
}





