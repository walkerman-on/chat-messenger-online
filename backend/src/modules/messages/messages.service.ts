import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message, MessageStatus } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { User } from '../users/entities/user.entity';
import { Chat } from '../chats/entities/chat.entity';

@Injectable()
export class MessagesService {
	constructor(
		@InjectRepository(Message)
		private messagesRepository: Repository<Message>,
		@InjectRepository(User)
		private usersRepository: Repository<User>,
		@InjectRepository(Chat)
		private chatsRepository: Repository<Chat>,
	) { }

	async create(createMessageDto: CreateMessageDto, userId: string): Promise<Message> {
		const user = await this.usersRepository.findOne({ where: { id: userId } });
		if (!user) {
			throw new NotFoundException('User not found');
		}

		const chat = await this.chatsRepository.findOne({ 
			where: { id: createMessageDto.chatId },
			relations: ['members'],
		});
		if (!chat) {
			throw new NotFoundException('Chat not found');
		}

		const message = this.messagesRepository.create({
			...createMessageDto,
			sender: user,
			chat: chat,
		});

		const savedMessage = await this.messagesRepository.save(message);

		return savedMessage;
	}


	async findChatMessages(chatId: string, limit: number = 50, offset: number = 0): Promise<Message[]> {
		try {
			// Строгая проверка и приведение к числам
			const limitNum = Number(limit);
			const offsetNum = Number(offset);
			
			// Валидация значений
			const validLimit = (!isNaN(limitNum) && limitNum > 0 && limitNum <= 100) 
				? Math.floor(limitNum) 
				: 50;
			const validOffset = (!isNaN(offsetNum) && offsetNum >= 0) 
				? Math.floor(offsetNum) 
				: 0;
			
			console.log(`Finding messages for chat ${chatId}, limit: ${validLimit} (type: ${typeof validLimit}), offset: ${validOffset} (type: ${typeof validOffset})`);
			
			// Проверяем существование чата
			const chat = await this.chatsRepository.findOne({ 
				where: { id: chatId }
			});
			
			if (!chat) {
				console.error(`Chat not found: ${chatId}`);
				throw new NotFoundException('Chat not found');
			}

			// Используем QueryBuilder - убеждаемся, что значения точно числа
			const queryBuilder = this.messagesRepository
				.createQueryBuilder('message')
				.leftJoinAndSelect('message.sender', 'sender')
				.leftJoinAndSelect('message.forwardedFrom', 'forwardedFrom')
				.leftJoinAndSelect('forwardedFrom.sender', 'forwardedFromSender')
				.where('message.chat_id = :chatId', { chatId })
				.orderBy('message.createdAt', 'ASC');
			
			// Применяем limit и offset - гарантируем, что это числа
			const finalLimit = Number(validLimit);
			const finalOffset = Number(validOffset);
			
			if (isNaN(finalLimit) || finalLimit <= 0) {
				throw new Error(`Invalid limit value: ${finalLimit}`);
			}
			if (isNaN(finalOffset) || finalOffset < 0) {
				throw new Error(`Invalid offset value: ${finalOffset}`);
			}
			
			queryBuilder.take(finalLimit);
			queryBuilder.skip(finalOffset);
			
			const messages = await queryBuilder.getMany();

			console.log(`Found ${messages.length} messages for chat ${chatId}`);
			return messages;
		} catch (error) {
			console.error('Error in findChatMessages:', error);
			console.error('Error details:', {
				message: error.message,
				stack: error.stack,
				chatId,
				limit,
				offset,
				limitType: typeof limit,
				offsetType: typeof offset
			});
			throw error;
		}
	}

	async delete(id: string): Promise<void> {
		const message = await this.messagesRepository.findOne({ where: { id } });
		if (!message) {
			throw new NotFoundException('Message not found');
		}
		await this.messagesRepository.remove(message);
	}

	async markAsRead(id: string): Promise<Message> {
		const message = await this.messagesRepository.findOne({ where: { id } });
		if (!message) {
			throw new NotFoundException('Message not found');
		}
		message.status = MessageStatus.READ;
		return this.messagesRepository.save(message);
	}

	async markAsDelivered(id: string): Promise<Message> {
		const message = await this.messagesRepository.findOne({ where: { id } });
		if (!message) {
			throw new NotFoundException('Message not found');
		}
		if (message.status !== MessageStatus.READ) {
			message.status = MessageStatus.DELIVERED;
			return this.messagesRepository.save(message);
		}
		return message;
	}

	async markChatMessagesAsDelivered(chatId: string, userId: string): Promise<void> {
		// Помечаем все сообщения в чате как доставлено, кроме тех, что отправил сам пользователь
		await this.messagesRepository
			.createQueryBuilder()
			.update(Message)
			.set({ status: MessageStatus.DELIVERED })
			.where('chat_id = :chatId', { chatId })
			.andWhere('sender_id != :userId', { userId })
			.andWhere('status = :status', { status: MessageStatus.SENT })
			.execute();
	}

	async markChatMessagesAsRead(chatId: string, userId: string): Promise<void> {
		// Помечаем все сообщения в чате как прочитано, кроме тех, что отправил сам пользователь
		await this.messagesRepository
			.createQueryBuilder()
			.update(Message)
			.set({ status: MessageStatus.READ })
			.where('chat_id = :chatId', { chatId })
			.andWhere('sender_id != :userId', { userId })
			.andWhere('status IN (:...statuses)', { statuses: [MessageStatus.SENT, MessageStatus.DELIVERED] })
			.execute();
	}

	async findOne(id: string): Promise<Message> {
		const message = await this.messagesRepository.findOne({
			where: { id },
			relations: ['chat'],
		});
		if (!message) {
			throw new NotFoundException('Message not found');
		}
		return message;
	}

	async remove(id: string, userId: string): Promise<void> {
		const message = await this.messagesRepository.findOne({
			where: { id },
			relations: ['sender'],
		});
		if (!message) {
			throw new NotFoundException('Message not found');
		}

		// Проверяем, что пользователь является отправителем сообщения
		if (message.sender.id !== userId) {
			throw new NotFoundException('Message not found');
		}

		await this.messagesRepository.remove(message);
	}

	async deleteChatMessages(chatId: string, userId: string): Promise<void> {
		// Проверяем, что чат существует и пользователь является участником
		const chat = await this.chatsRepository.findOne({
			where: { id: chatId },
			relations: ['members'],
		});

		if (!chat) {
			throw new NotFoundException('Chat not found');
		}

		const isMember = chat.members.some(member => member.id === userId);
		if (!isMember) {
			throw new NotFoundException('Chat not found');
		}

		await this.messagesRepository
			.createQueryBuilder()
			.delete()
			.from(Message)
			.where('chat_id = :chatId', { chatId })
			.execute();
	}

	async update(id: string, updateDto: { content?: string }, userId: string): Promise<Message> {
		const message = await this.messagesRepository.findOne({
			where: { id },
			relations: ['sender', 'chat'],
		});

		if (!message) {
			throw new NotFoundException('Message not found');
		}

		// Проверяем, что пользователь является отправителем сообщения
		if (message.sender.id !== userId) {
			throw new NotFoundException('Message not found');
		}

		// Обновляем только текстовое содержимое
		if (updateDto.content !== undefined) {
			message.content = updateDto.content;
			message.editedAt = new Date();
		}

		return this.messagesRepository.save(message);
	}
}