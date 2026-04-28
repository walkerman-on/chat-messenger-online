import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { Message } from './entities/message.entity';
import { User } from '../users/entities/user.entity';
import { Chat } from '../chats/entities/chat.entity';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([Message, User, Chat]),
		forwardRef(() => WebsocketModule),
	],
	controllers: [MessagesController],
	providers: [MessagesService],
	exports: [MessagesService],
})
export class MessagesModule { }