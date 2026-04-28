import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
	ManyToMany,
	JoinTable,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Chat } from '../../chats/entities/chat.entity';
import { Message } from '../../messages/entities/message.entity';

export enum TaskStatus {
	OPEN = 'open',
	IN_PROGRESS = 'in_progress',
	COMPLETED = 'completed',
	CANCELLED = 'cancelled',
}

@Entity('tasks')
export class Task {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	title: string;

	@Column({ type: 'text', nullable: true })
	description: string;

	@Column()
	hashtag: string; // Например, #кв304

	@Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.OPEN })
	status: TaskStatus;

	@ManyToOne(() => Chat, { nullable: true })
	@JoinColumn({ name: 'chat_id' })
	chat: Chat | null;

	@ManyToOne(() => User, { nullable: false })
	@JoinColumn({ name: 'created_by' })
	createdBy: User;

	@ManyToMany(() => User)
	@JoinTable({
		name: 'task_assignees',
		joinColumn: { name: 'task_id', referencedColumnName: 'id' },
		inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
	})
	assignees: User[]; // Упомянутые пользователи

	@ManyToOne(() => Message, { nullable: true })
	@JoinColumn({ name: 'message_id' })
	message: Message; // Сообщение, из которого создана задача

	@Column({ type: 'timestamp', nullable: true })
	dueDate: Date;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}

