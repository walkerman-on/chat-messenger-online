import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { Chat } from './entities/chat.entity';
import { User } from '../users/entities/user.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Chat, User])],
	controllers: [ChatsController],
	providers: [ChatsService],
	exports: [ChatsService],
})
export class ChatsModule { }






