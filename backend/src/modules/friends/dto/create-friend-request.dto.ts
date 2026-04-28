import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFriendRequestDto {
	@ApiProperty()
	@IsUUID('4')
	receiverId: string;
}

