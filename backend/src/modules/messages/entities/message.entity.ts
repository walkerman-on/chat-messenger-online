import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Chat } from '../../chats/entities/chat.entity';

export enum MessageType {
	TEXT = 'text',
	AUDIO = 'audio',
	IMAGE = 'image',
	FILE = 'file',
}

export enum MessageStatus {
	SENT = 'sent',
	DELIVERED = 'delivered',
	READ = 'read',
}

@Entity('messages')
export class Message {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ type: 'enum', enum: MessageType })
	type: MessageType;

	@Column('text', { nullable: true })
	content: string;

	@Column({ nullable: true })
	fileUrl: string;

	@Column({ nullable: true, name: 'forwarded_from_id' })
	forwardedFromId: string;

	@ManyToOne(() => Message, { nullable: true })
	@JoinColumn({ name: 'forwarded_from_id' })
	forwardedFrom: Message;

	@Column({ type: 'enum', enum: MessageStatus, default: MessageStatus.SENT })
	status: MessageStatus;

	@ManyToOne(() => User, { nullable: false })
	@JoinColumn({ name: 'sender_id' })
	sender: User;

	@ManyToOne(() => Chat, { nullable: false, onDelete: 'CASCADE' })
	@JoinColumn({ name: 'chat_id' })
	chat: Chat;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	@Column({ type: 'timestamp', nullable: true })
	editedAt: Date;
}





