import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { TwoFactorService } from '../two-factor/two-factor.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private jwtService: JwtService,
		private configService: ConfigService,
		private twoFactorService: TwoFactorService,
	) { }

	async register(registerDto: RegisterDto) {
		const user = await this.usersService.create(registerDto);

		return this.generateTokens(user);
	}

	async login(loginDto: LoginDto) {
		const user = await this.usersService.findByEmail(loginDto.email);

		if (!user) {
			throw new UnauthorizedException('Invalid credentials');
		}

		const isPasswordValid = await this.usersService.validatePassword(
			loginDto.password,
			user.password,
		);

		if (!isPasswordValid) {
			throw new UnauthorizedException('Invalid credentials');
		}

		// Проверяем, включена ли 2FA
		if (user.twoFactorEnabled) {
			if (!loginDto.twoFactorCode) {
				throw new BadRequestException('2FA code is required');
			}

			const isCodeValid = await this.twoFactorService.verifyCode(user.id, loginDto.twoFactorCode);
			if (!isCodeValid) {
				throw new UnauthorizedException('Invalid 2FA code');
			}
		}

		return this.generateTokens(user);
	}

	async refresh(userId: string) {
		const user = await this.usersService.findById(userId);
		return this.generateTokens(user);
	}

	private generateTokens(user: any) {
		const payload = { email: user.email, sub: user.id, username: user.username };

		const accessToken = this.jwtService.sign(payload, {
			secret: this.configService.get('JWT_SECRET'),
			expiresIn: this.configService.get('JWT_EXPIRES_IN'),
		});

		const refreshToken = this.jwtService.sign(payload, {
			secret: this.configService.get('JWT_REFRESH_SECRET'),
			expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
		});

		// Remove password from response
		const { password, ...userWithoutPassword } = user;

		return {
			accessToken,
			refreshToken,
			user: userWithoutPassword,
		};
	}
}

