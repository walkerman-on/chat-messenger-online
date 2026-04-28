import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from './entities/task.entity';
import { User } from '../users/entities/user.entity';
import { Chat } from '../chats/entities/chat.entity';
import { Message } from '../messages/entities/message.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Task, User, Chat, Message])],
	controllers: [TasksController],
	providers: [TasksService],
	exports: [TasksService],
})
export class TasksModule { }

