import {
	WebSocketGateway,
	SubscribeMessage,
	MessageBody,
	ConnectedSocket,
	OnGatewayInit,
	OnGatewayConnection,
	OnGatewayDisconnect,
	WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from '../messages/messages.service';
import { UsersService } from '../users/users.service';
import { UserStatus } from '../users/entities/user.entity';

@WebSocketGateway({
	cors: {
		origin: '*',
	},
	namespace: '/chat',
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;

	private onlineUsers = new Map<string, string>();

	constructor(
		private messagesService: MessagesService,
		private usersService: UsersService,
	) { }

	afterInit(server: Server) {
		console.log('WebSocket Gateway initialized');
	}

	async handleConnection(client: Socket) {
		const userId = client.handshake.auth.userId;
		if (userId) {
			client.join(userId);
			this.onlineUsers.set(client.id, userId);

			// Update user status to online in database
			try {
				await this.usersService.updateStatus(userId, UserStatus.ONLINE);
			} catch (error) {
				console.error('Error updating user status to online:', error);
			}

			// Notify others that user is online
			client.broadcast.emit('user-online', { userId });
			console.log(`Client connected: ${userId}`);
		}
	}

	async handleDisconnect(client: Socket) {
		const userId = this.onlineUsers.get(client.id);
		if (userId) {
			this.onlineUsers.delete(client.id);

			// Update user status to offline in database
			try {
				const updatedUser = await this.usersService.updateStatus(userId, UserStatus.OFFLINE);
				// Notify others that user is offline with lastSeen
				client.broadcast.emit('user-offline', { 
					userId,
					lastSeen: updatedUser.lastSeen?.toISOString()
				});
			} catch (error) {
				console.error('Error updating user status to offline:', error);
				// Still notify even if update failed
				client.broadcast.emit('user-offline', { userId });
			}

			console.log(`Client disconnected: ${userId}`);
		}
	}

	@SubscribeMessage('join-chat')
	handleJoinChat(@ConnectedSocket() client: Socket, @MessageBody() data: { chatId: string }) {
		const userId = this.onlineUsers.get(client.id);
		client.join(data.chatId);
		console.log(`User ${userId} (socket ${client.id}) joined chat: ${data.chatId}`);
	}

	@SubscribeMessage('leave-chat')
	handleLeaveChat(@ConnectedSocket() client: Socket, @MessageBody() data: { chatId: string }) {
		client.leave(data.chatId);
		console.log(`User left chat: ${data.chatId}`);
	}

	@SubscribeMessage('send-message')
	async handleSendMessage(@MessageBody() data: any) {
		try {
			const message = await this.messagesService.create(data, data.senderId);

			// Broadcast to all members of the chat
			this.server.to(data.chatId).emit('new-message', message);

			return message;
		} catch (error) {
			console.error('Error sending message:', error);
			return { error: error.message };
		}
	}

	@SubscribeMessage('typing-start')
	handleTypingStart(@ConnectedSocket() client: Socket, @MessageBody() data: { chatId: string }) {
		const userId = this.onlineUsers.get(client.id);
		if (userId) {
			client.to(data.chatId).emit('user-typing', { userId, chatId: data.chatId });
		}
	}

	@SubscribeMessage('typing-stop')
	handleTypingStop(@ConnectedSocket() client: Socket, @MessageBody() data: { chatId: string }) {
		const userId = this.onlineUsers.get(client.id);
		if (userId) {
			client.to(data.chatId).emit('user-stopped-typing', { userId, chatId: data.chatId });
		}
	}

	@SubscribeMessage('mark-as-read')
	async handleMarkAsRead(@MessageBody() data: { messageId: string, userId: string }) {
		try {
			await this.messagesService.markAsRead(data.messageId);
			return { success: true };
		} catch (error) {
			console.error('Error marking message as read:', error);
			return { error: error.message };
		}
	}
}

