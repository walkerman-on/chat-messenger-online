import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class AppController {
	@Get()
	@ApiOperation({ summary: 'Health check' })
	getHealth() {
		return {
			status: 'ok',
			message: 'Telegram Clone Backend API',
			timestamp: new Date().toISOString(),
		};
	}
}






