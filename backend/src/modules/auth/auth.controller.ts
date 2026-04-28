import { Controller, Post, Body, UseGuards, Get, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) { }

	@Public()
	@Post('register')
	@ApiOperation({ summary: 'Register a new user' })
	@ApiResponse({ status: 201, description: 'User successfully registered', type: TokenResponseDto })
	@ApiResponse({ status: 409, description: 'User already exists' })
	async register(@Body() registerDto: RegisterDto) {
		return this.authService.register(registerDto);
	}

	@Public()
	@Post('login')
	@HttpCode(200)
	@ApiOperation({ summary: 'Login user' })
	@ApiResponse({ status: 200, description: 'Successfully logged in', type: TokenResponseDto })
	@ApiResponse({ status: 401, description: 'Invalid credentials' })
	async login(@Body() loginDto: LoginDto) {
		return this.authService.login(loginDto);
	}

	@UseGuards(JwtAuthGuard)
	@Post('refresh')
	@HttpCode(200)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Refresh access token' })
	@ApiResponse({ status: 200, description: 'Token refreshed successfully', type: TokenResponseDto })
	async refresh(@CurrentUser() user: any) {
		return this.authService.refresh(user.id);
	}

	@UseGuards(JwtAuthGuard)
	@Get('me')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get current user' })
	@ApiResponse({ status: 200, description: 'Current user information' })
	async me(@CurrentUser() user: any) {
		return user;
	}
}






