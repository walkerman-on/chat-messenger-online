import { IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MessagePrivacy } from '../entities/privacy-settings.entity';

export class UpdatePrivacySettingsDto {
	@ApiProperty({ enum: MessagePrivacy, required: false })
	@IsOptional()
	@IsEnum(MessagePrivacy)
	whoCanMessageMe?: MessagePrivacy;

	@ApiProperty({ required: false })
	@IsOptional()
	@IsBoolean()
	allowFriendRequests?: boolean;

	@ApiProperty({ required: false })
	@IsOptional()
	@IsBoolean()
	showOnlineStatus?: boolean;

	@ApiProperty({ required: false })
	@IsOptional()
	@IsBoolean()
	showReadReceipts?: boolean;
}






