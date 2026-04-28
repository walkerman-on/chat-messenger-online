import { Module, forwardRef } from '@nestjs/common';
import { ChatGateway } from './websocket.gateway';
import { MessagesModule } from '../messages/messages.module';
import { UsersModule } from '../users/users.module';

@Module({
	imports: [forwardRef(() => MessagesModule), UsersModule],
	providers: [ChatGateway],
	exports: [ChatGateway],
})
export class WebsocketModule { }