import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { FriendsModule } from './modules/friends/friends.module';
import { ChatsModule } from './modules/chats/chats.module';
import { MessagesModule } from './modules/messages/messages.module';
import { SettingsModule } from './modules/settings/settings.module';
import { WebsocketModule } from './modules/websocket/websocket.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { TwoFactorModule } from './modules/two-factor/two-factor.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { User } from './modules/users/entities/user.entity';
import { Chat } from './modules/chats/entities/chat.entity';
import { Message } from './modules/messages/entities/message.entity';
import { FriendRequest } from './modules/friends/entities/friend-request.entity';
import { PrivacySettings } from './modules/settings/entities/privacy-settings.entity';
import { Task } from './modules/tasks/entities/task.entity';

@Module({
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: APP_GUARD,
			useClass: JwtAuthGuard,
		},
	],
	imports: [
		// Configuration
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: '.env',
		}),

		// Database
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				type: 'postgres',
				host: configService.get('DATABASE_HOST'),
				port: configService.get('DATABASE_PORT'),
				username: configService.get('DATABASE_USER'),
				password: configService.get('DATABASE_PASSWORD'),
				database: configService.get('DATABASE_NAME'),
				entities: [User, Chat, Message, FriendRequest, PrivacySettings, Task],
				synchronize: configService.get('NODE_ENV') !== 'production',
				logging: configService.get('NODE_ENV') === 'development',
			}),
		}),

		// Redis Cache - using simple in-memory cache for development
		// For production, configure Redis properly with cache-manager v5
		CacheModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			isGlobal: true,
			useFactory: () => ({
				ttl: 600, // 10 minutes
				max: 100,
			}),
		}),

		// Feature modules
		AuthModule,
		UsersModule,
		FriendsModule,
		ChatsModule,
		MessagesModule,
		SettingsModule,
		WebsocketModule,
		TasksModule,
		TwoFactorModule,
	],
})
export class AppModule { }
