import { IsString, IsEnum, IsArray, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ChatType, SecurityLevel } from '../entities/chat.entity';

export class CreateChatDto {
	@ApiProperty()
	@IsString()
	name: string;

	@ApiProperty({ enum: ChatType })
	@IsEnum(ChatType)
	type: ChatType;

	@ApiProperty({ type: [String] })
	@IsArray()
	@IsUUID('4', { each: true })
	memberIds: string[];

	@ApiProperty({ enum: SecurityLevel, required: false, default: SecurityLevel.NONE })
	@IsOptional()
	@IsEnum(SecurityLevel)
	securityLevel?: SecurityLevel;
}





