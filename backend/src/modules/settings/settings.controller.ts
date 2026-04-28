import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdatePrivacySettingsDto } from './dto/update-privacy-settings.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Settings')
@Controller('settings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SettingsController {
	constructor(private readonly settingsService: SettingsService) { }

	@Get()
	@ApiOperation({ summary: 'Get privacy settings' })
	@ApiResponse({ status: 200, description: 'Privacy settings' })
	getSettings(@CurrentUser() user: any) {
		return this.settingsService.getSettings(user.id);
	}

	@Patch()
	@ApiOperation({ summary: 'Update privacy settings' })
	@ApiResponse({ status: 200, description: 'Settings updated successfully' })
	updateSettings(
		@CurrentUser() user: any,
		@Body() updateDto: UpdatePrivacySettingsDto,
	) {
		return this.settingsService.updateSettings(user.id, updateDto);
	}
}






