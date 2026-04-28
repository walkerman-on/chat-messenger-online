import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from './entities/task.entity';
import { User } from '../users/entities/user.entity';
import { Chat } from '../chats/entities/chat.entity';
import { Message } from '../messages/entities/message.entity';
import { CreateTaskDto } from './dto/create-task.dto';

@Injectable()
export class TasksService {
	constructor(
		@InjectRepository(Task)
		private tasksRepository: Repository<Task>,
		@InjectRepository(User)
		private usersRepository: Repository<User>,
		@InjectRepository(Chat)
		private chatsRepository: Repository<Chat>,
		@InjectRepository(Message)
		private messagesRepository: Repository<Message>,
	) { }

	async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
		const creator = await this.usersRepository.findOne({ where: { id: userId } });
		if (!creator) {
			throw new NotFoundException('User not found');
		}

		// Chat опционален, так как задачи могут быть не привязаны к чатам
		let chat: Chat | null = null;
		if (createTaskDto.chatId) {
			chat = await this.chatsRepository.findOne({ where: { id: createTaskDto.chatId } });
			if (!chat) {
				throw new NotFoundException('Chat not found');
			}

			// Проверяем, что хештег уникален в рамках чата (если чат указан)
			if (createTaskDto.hashtag) {
				const existingTask = await this.tasksRepository.findOne({
					where: {
						chat: { id: createTaskDto.chatId },
						hashtag: createTaskDto.hashtag,
						status: TaskStatus.OPEN,
					},
				});

				if (existingTask) {
					throw new BadRequestException(`Задача с хештегом ${createTaskDto.hashtag} уже существует`);
				}
			}
		}

		// Генерируем хештег, если не указан
		const hashtag = createTaskDto.hashtag || `#task-${Date.now()}`;

		const assignees: User[] = [];
		if (createTaskDto.assigneeIds && createTaskDto.assigneeIds.length > 0) {
			const users = await this.usersRepository.find({
				where: createTaskDto.assigneeIds.map(id => ({ id })),
			});
			assignees.push(...users);
		}

		if (assignees.length === 0) {
			throw new BadRequestException('Необходимо указать хотя бы одного исполнителя');
		}

		let message: Message | null = null;
		if (createTaskDto.messageId) {
			message = await this.messagesRepository.findOne({
				where: { id: createTaskDto.messageId },
			});
		}

		const task = this.tasksRepository.create({
			title: createTaskDto.title,
			description: createTaskDto.description,
			hashtag,
			chat: chat || undefined,
			createdBy: creator,
			assignees,
			message: message || undefined,
			dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
			status: TaskStatus.OPEN,
		});

		return this.tasksRepository.save(task);
	}

	async findByChat(chatId: string): Promise<Task[]> {
		console.log('[TASKS] Finding tasks for chat:', chatId);
		const tasks = await this.tasksRepository.find({
			where: { chat: { id: chatId } },
			relations: ['createdBy', 'assignees', 'message', 'chat'],
			order: { createdAt: 'DESC' },
		});
		console.log('[TASKS] Found tasks:', tasks.length);
		return tasks;
	}

	async findOne(id: string): Promise<Task> {
		const task = await this.tasksRepository.findOne({
			where: { id },
			relations: ['createdBy', 'assignees', 'message', 'chat'],
		});

		if (!task) {
			throw new NotFoundException('Task not found');
		}

		return task;
	}

	async findByHashtag(chatId: string, hashtag: string): Promise<Task | null> {
		return this.tasksRepository.findOne({
			where: {
				chat: { id: chatId },
				hashtag,
			},
			relations: ['createdBy', 'assignees'],
		});
	}

	async updateStatus(id: string, status: TaskStatus, userId: string): Promise<Task> {
		const task = await this.tasksRepository.findOne({
			where: { id },
			relations: ['chat', 'chat.members', 'assignees', 'createdBy'],
		});

		if (!task) {
			throw new NotFoundException('Task not found');
		}

		// Проверяем, что пользователь является исполнителем или создателем задачи
		const isAssignee = task.assignees?.some((assignee: User) => assignee.id === userId);
		const isCreator = task.createdBy.id === userId;

		// Если задача привязана к чату, проверяем членство в чате
		if (task.chat) {
			const isMember = task.chat.members?.some((member: User) => member.id === userId);
			if (!isMember && !isAssignee && !isCreator) {
				throw new NotFoundException('Task not found');
			}
		} else {
			// Если задача не привязана к чату, проверяем только исполнителя или создателя
			if (!isAssignee && !isCreator) {
				throw new NotFoundException('Task not found');
			}
		}

		task.status = status;
		return this.tasksRepository.save(task);
	}

	async completeByHashtag(chatId: string, hashtag: string, userId: string): Promise<Task> {
		const task = await this.findByHashtag(chatId, hashtag);

		if (!task) {
			throw new NotFoundException(`Задача с хештегом ${hashtag} не найдена`);
		}

		return this.updateStatus(task.id, TaskStatus.COMPLETED, userId);
	}

	async delete(id: string, userId: string): Promise<void> {
		const task = await this.findOne(id);

		// Только создатель задачи может её удалить
		if (task.createdBy.id !== userId) {
			throw new BadRequestException('Only task creator can delete it');
		}

		await this.tasksRepository.remove(task);
	}

	async findAssignedToUser(userId: string): Promise<Task[]> {
		return this.tasksRepository
			.createQueryBuilder('task')
			.leftJoinAndSelect('task.createdBy', 'createdBy')
			.leftJoinAndSelect('task.assignees', 'assignees')
			.leftJoinAndSelect('task.chat', 'chat')
			.where('assignees.id = :userId', { userId })
			.orderBy('task.createdAt', 'DESC')
			.getMany();
	}

	async findCreatedByUser(userId: string): Promise<Task[]> {
		return this.tasksRepository.find({
			where: { createdBy: { id: userId } },
			relations: ['createdBy', 'assignees', 'chat'],
			order: { createdAt: 'DESC' },
		});
	}
}

