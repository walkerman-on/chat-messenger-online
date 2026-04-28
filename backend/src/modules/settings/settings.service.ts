import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PrivacySettings } from './entities/privacy-settings.entity';
import { User } from '../users/entities/user.entity';
import { UpdatePrivacySettingsDto } from './dto/update-privacy-settings.dto';

@Injectable()
export class SettingsService {
	constructor(
		@InjectRepository(PrivacySettings)
		private settingsRepository: Repository<PrivacySettings>,
		@InjectRepository(User)
		private userRepository: Repository<User>,
	) { }

	async getOrCreateSettings(userId: string): Promise<PrivacySettings> {
		let settings = await this.settingsRepository.findOne({
			where: { user: { id: userId } },
			relations: ['user'],
		});

		if (!settings) {
			const user = await this.userRepository.findOne({ where: { id: userId } });
			if (!user) {
				throw new NotFoundException('User not found');
			}

			settings = this.settingsRepository.create({ user });
			await this.settingsRepository.save(settings);
		}

		return settings;
	}

	async updateSettings(userId: string, updateDto: UpdatePrivacySettingsDto) {
		const settings = await this.getOrCreateSettings(userId);
		Object.assign(settings, updateDto);
		return this.settingsRepository.save(settings);
	}

	async getSettings(userId: string) {
		return this.getOrCreateSettings(userId);
	}
}






