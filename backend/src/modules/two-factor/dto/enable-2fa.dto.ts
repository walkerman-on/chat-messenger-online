import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Enable2FADto {
	@ApiProperty()
	@IsString()
	@Length(6, 6)
	code: string;
}


