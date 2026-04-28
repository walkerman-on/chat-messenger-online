import {
	Controller,
	Post,
	Delete,
	Get,
	Body,
	UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TwoFactorService } from './two-factor.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Enable2FADto } from './dto/enable-2fa.dto';

@ApiTags('Two-Factor Authentication')
@Controller('two-factor')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TwoFactorController {
	constructor(private readonly twoFactorService: TwoFactorService) { }

	@Get('status')
	@ApiOperation({ summary: 'Get 2FA status' })
	@ApiResponse({ status: 200, description: '2FA status' })
	getStatus(@CurrentUser() user: any) {
		return this.twoFactorService.get2FAStatus(user.id);
	}

	@Post('generate-secret')
	@ApiOperation({ summary: 'Generate 2FA secret and QR code' })
	@ApiResponse({ status: 200, description: 'Secret and QR code generated' })
	generateSecret(@CurrentUser() user: any) {
		return this.twoFactorService.generateSecret(user.id);
	}

	@Post('enable')
	@ApiOperation({ summary: 'Enable 2FA' })
	@ApiResponse({ status: 200, description: '2FA enabled successfully' })
	enable(@CurrentUser() user: any, @Body() dto: Enable2FADto) {
		return this.twoFactorService.enable2FA(user.id, dto);
	}

	@Delete('disable')
	@ApiOperation({ summary: 'Disable 2FA' })
	@ApiResponse({ status: 200, description: '2FA disabled successfully' })
	disable(@CurrentUser() user: any) {
		return this.twoFactorService.disable2FA(user.id);
	}
}


