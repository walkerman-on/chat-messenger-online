import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { PrivacySettings } from './entities/privacy-settings.entity';
import { User } from '../users/entities/user.entity';

@Module({
	imports: [TypeOrmModule.forFeature([PrivacySettings, User])],
	controllers: [SettingsController],
	providers: [SettingsService],
	exports: [SettingsService],
})
export class SettingsModule { }






