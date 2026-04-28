import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat, SecurityLevel } from './entities/chat.entity';
import { User } from '../users/entities/user.entity';
import { CreateChatDto } from './dto/create-chat.dto';

@Injectable()
export class ChatsService {
	constructor(
		@InjectRepository(Chat)
		private chatsRepository: Repository<Chat>,
		@InjectRepository(User)
		private usersRepository: Repository<User>,
	) { }

	async create(createChatDto: CreateChatDto, userId: string): Promise<Chat> {
		const creator = await this.usersRepository.findOne({ where: { id: userId } });
		if (!creator) {
			throw new NotFoundException('User not found');
		}

		const members = await this.usersRepository.find({
			where: createChatDto.memberIds.map(id => ({ id })),
		});

		// Добавляем создателя в список участников, если его там нет
		const allMembers = [...members];
		if (!allMembers.find(m => m.id === userId)) {
			allMembers.push(creator);
		}

		const chat = this.chatsRepository.create({
			name: createChatDto.name,
			type: createChatDto.type as any,
			createdBy: creator,
			members: allMembers,
			securityLevel: createChatDto.securityLevel || SecurityLevel.NONE,
		});

		return this.chatsRepository.save(chat);
	}

	async findAll(userId: string): Promise<Chat[]> {
		return this.chatsRepository.find({
			where: {
				members: { id: userId },
			},
			relations: ['members', 'createdBy'],
		});
	}

	async findOne(id: string, userId: string): Promise<Chat> {
		const chat = await this.chatsRepository.findOne({
			where: { id },
			relations: ['members', 'createdBy'],
		});

		if (!chat) {
			throw new NotFoundException('Chat not found');
		}

		// Проверяем, что пользователь является участником чата
		const isMember = chat.members.some(member => member.id === userId);
		if (!isMember) {
			throw new NotFoundException('Chat not found');
		}

		return chat;
	}

	async addMember(chatId: string, memberId: string): Promise<Chat> {
		const chat = await this.chatsRepository.findOne({
			where: { id: chatId },
			relations: ['members'],
		});

		if (!chat) {
			throw new NotFoundException('Chat not found');
		}

		const user = await this.usersRepository.findOne({ where: { id: memberId } });
		if (!user) {
			throw new NotFoundException('User not found');
		}

		if (!chat.members.find(m => m.id === memberId)) {
			chat.members.push(user);
			await this.chatsRepository.save(chat);
		}

		return chat;
	}

	async removeMember(chatId: string, memberId: string): Promise<void> {
		const chat = await this.chatsRepository.findOne({
			where: { id: chatId },
			relations: ['members'],
		});

		if (!chat) {
			throw new NotFoundException('Chat not found');
		}

		chat.members = chat.members.filter(m => m.id !== memberId);
		await this.chatsRepository.save(chat);
	}

	async remove(id: string, userId: string): Promise<void> {
		const chat = await this.chatsRepository.findOne({
			where: { id },
			relations: ['members', 'createdBy'],
		});
		if (!chat) {
			throw new NotFoundException('Chat not found');
		}

		// Проверяем, что пользователь является участником чата
		const isMember = chat.members.some(member => member.id === userId);
		if (!isMember) {
			throw new NotFoundException('Chat not found');
		}

		await this.chatsRepository.remove(chat);
	}
}
