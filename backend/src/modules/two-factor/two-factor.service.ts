import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { Enable2FADto } from './dto/enable-2fa.dto';
import { Verify2FADto } from './dto/verify-2fa.dto';

@Injectable()
export class TwoFactorService {
	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>,
	) { }

	async generateSecret(userId: string): Promise<{ secret: string; qrCodeUrl: string }> {
		const user = await this.usersRepository.findOne({ where: { id: userId } });
		if (!user) {
			throw new BadRequestException('User not found');
		}

		// Генерируем секрет для TOTP
		const secret = speakeasy.generateSecret({
			name: `Telegram Clone (${user.email})`,
			issuer: 'Telegram Clone',
			length: 32,
		});

		// Сохраняем секрет (но не включаем 2FA пока не подтвердят код)
		user.twoFactorSecret = secret.base32;
		await this.usersRepository.save(user);

		// Генерируем QR-код
		const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

		return {
			secret: secret.base32!,
			qrCodeUrl,
		};
	}

	async enable2FA(userId: string, dto: Enable2FADto): Promise<void> {
		const user = await this.usersRepository.findOne({ where: { id: userId } });
		if (!user || !user.twoFactorSecret) {
			throw new BadRequestException('2FA secret not generated. Please generate secret first.');
		}

		// Проверяем код
		const verified = speakeasy.totp.verify({
			secret: user.twoFactorSecret,
			encoding: 'base32',
			token: dto.code,
			window: 2, // Разрешаем отклонение в ±2 периода (60 секунд)
		});

		if (!verified) {
			throw new BadRequestException('Invalid verification code');
		}

		// Включаем 2FA
		user.twoFactorEnabled = true;
		await this.usersRepository.save(user);
	}

	async disable2FA(userId: string): Promise<void> {
		const user = await this.usersRepository.findOne({ where: { id: userId } });
		if (!user) {
			throw new BadRequestException('User not found');
		}

		user.twoFactorEnabled = false;
		user.twoFactorSecret = null;
		await this.usersRepository.save(user);
	}

	async verifyCode(userId: string, code: string): Promise<boolean> {
		const user = await this.usersRepository.findOne({ where: { id: userId } });
		if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
			throw new UnauthorizedException('2FA is not enabled for this user');
		}

		const verified = speakeasy.totp.verify({
			secret: user.twoFactorSecret,
			encoding: 'base32',
			token: code,
			window: 2,
		});

		return verified;
	}

	async get2FAStatus(userId: string): Promise<{ enabled: boolean; hasSecret: boolean }> {
		const user = await this.usersRepository.findOne({ where: { id: userId } });
		if (!user) {
			throw new BadRequestException('User not found');
		}

		return {
			enabled: user.twoFactorEnabled || false,
			hasSecret: !!user.twoFactorSecret,
		};
	}
}


