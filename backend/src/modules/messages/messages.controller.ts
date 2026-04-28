import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Delete,
	UseGuards,
	Query,
	Patch,
	Inject,
	forwardRef,
	NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ChatGateway } from '../websocket/websocket.gateway';

@ApiTags('Messages')
@Controller('messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessagesController {
	constructor(
		private readonly messagesService: MessagesService,
		@Inject(forwardRef(() => ChatGateway))
		private readonly chatGateway: ChatGateway,
	) { }

	@Post()
	@ApiOperation({ summary: 'Send a message' })
	@ApiResponse({ status: 201, description: 'Message sent successfully' })
	async create(@Body() createMessageDto: CreateMessageDto, @CurrentUser() user: any) {
		const message = await this.messagesService.create(createMessageDto, user.id);

		// Автоматически помечаем все сообщения в чате как доставлено для других участников
		await this.messagesService.markChatMessagesAsDelivered(createMessageDto.chatId, user.id);

		// Отправляем WebSocket уведомление всем участникам чата
		console.log(`Sending message notification to chat ${createMessageDto.chatId}`);
		const socketsInRoom = await this.chatGateway.server.in(createMessageDto.chatId).fetchSockets();
		console.log(`Sockets in room ${createMessageDto.chatId}:`, socketsInRoom.length);

		this.chatGateway.server.to(createMessageDto.chatId).emit('new-message', message);
		this.chatGateway.server.to(createMessageDto.chatId).emit('messages-delivered', { 
			chatId: createMessageDto.chatId, 
			userId: user.id 
		});
		console.log('Message notification sent:', message.id);

		return message;
	}

	@Get('chat/:chatId')
	@ApiOperation({ summary: 'Get messages for a chat' })
	@ApiResponse({ status: 200, description: 'List of messages' })
	async findChatMessages(
		@Param('chatId') chatId: string,
		@CurrentUser() user: any,
		@Query('limit') limit?: string | number,
		@Query('offset') offset?: string | number,
	) {
		try {
			console.log(`Request to get messages for chat ${chatId}, limit: ${limit}, offset: ${offset}`);
			
			// Убеждаемся, что значения являются числами
			let limitNum: number;
			let offsetNum: number;
			
			if (limit !== undefined && limit !== null && limit !== '') {
				const parsed = typeof limit === 'string' ? parseInt(limit, 10) : Number(limit);
				limitNum = !isNaN(parsed) && parsed > 0 ? Math.min(Math.floor(parsed), 100) : 50;
			} else {
				limitNum = 50;
			}
			
			if (offset !== undefined && offset !== null && offset !== '') {
				const parsed = typeof offset === 'string' ? parseInt(offset, 10) : Number(offset);
				offsetNum = !isNaN(parsed) && parsed >= 0 ? Math.floor(parsed) : 0;
			} else {
				offsetNum = 0;
			}
			
			console.log(`Parsed values - limit: ${limitNum}, offset: ${offsetNum}`);
			
			// Сначала помечаем сообщения как прочитано
			await this.messagesService.markChatMessagesAsRead(chatId, user.id);
			
			// Затем загружаем сообщения с уже обновленными статусами
			const result = await this.messagesService.findChatMessages(chatId, limitNum, offsetNum);
			
			console.log(`Successfully fetched ${result.length} messages`);
			return result;
		} catch (error) {
			console.error('Error fetching messages:', error);
			console.error('Error stack:', error.stack);
			throw error;
		}
	}

	@Patch(':id/delivered')
	@ApiOperation({ summary: 'Mark message as delivered' })
	@ApiResponse({ status: 200, description: 'Message marked as delivered' })
	markAsDelivered(@Param('id') id: string) {
		return this.messagesService.markAsDelivered(id);
	}

	@Patch(':id/read')
	@ApiOperation({ summary: 'Mark message as read' })
	@ApiResponse({ status: 200, description: 'Message marked as read' })
	markAsRead(@Param('id') id: string) {
		return this.messagesService.markAsRead(id);
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Delete message' })
	@ApiResponse({ status: 200, description: 'Message deleted successfully' })
	async remove(@Param('id') id: string, @CurrentUser() user: any) {
		const message = await this.messagesService.findOne(id);
		if (!message) {
			throw new NotFoundException('Message not found');
		}
		
		await this.messagesService.remove(id, user.id);
		
		// Отправляем WebSocket уведомление всем участникам чата
		this.chatGateway.server.to(message.chat.id).emit('message-deleted', { messageId: id, chatId: message.chat.id });
		
		return { success: true };
	}

	@Delete('chat/:chatId')
	@ApiOperation({ summary: 'Delete all messages in chat' })
	@ApiResponse({ status: 200, description: 'All messages deleted successfully' })
	async deleteChatMessages(@Param('chatId') chatId: string, @CurrentUser() user: any) {
		await this.messagesService.deleteChatMessages(chatId, user.id);
		
		// Уведомляем всех участников чата через WebSocket
		this.chatGateway.server.to(chatId).emit('messages-deleted', { chatId });
		
		return { success: true };
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Update message' })
	@ApiResponse({ status: 200, description: 'Message updated successfully' })
	async update(
		@Param('id') id: string,
		@Body() updateMessageDto: UpdateMessageDto,
		@CurrentUser() user: any,
	) {
		const message = await this.messagesService.update(id, updateMessageDto, user.id);

		// Отправляем WebSocket уведомление всем участникам чата
		this.chatGateway.server.to(message.chat.id).emit('message-updated', message);

		return message;
	}
}

