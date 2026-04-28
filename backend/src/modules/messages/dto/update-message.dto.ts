import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateMessageDto {
	@ApiProperty({ required: false })
	@IsOptional()
	@IsString()
	content?: string;
}

