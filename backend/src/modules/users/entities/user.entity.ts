import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
	ManyToMany,
	JoinTable,
} from 'typeorm';
import { Chat } from '../../chats/entities/chat.entity';
import { Message } from '../../messages/entities/message.entity';
import { FriendRequest } from '../../friends/entities/friend-request.entity';
import { PrivacySettings } from '../../settings/entities/privacy-settings.entity';

export enum UserStatus {
	ONLINE = 'online',
	OFFLINE = 'offline',
	AWAY = 'away',
}

@Entity('users')
export class User {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ unique: true })
	email: string;

	@Column()
	password: string;

	@Column()
	username: string;

	@Column()
	firstName: string;

	@Column()
	lastName: string;

	@Column({ nullable: true })
	avatar: string;

	@Column({ nullable: true })
	status: UserStatus;

	@Column({ nullable: true, type: 'timestamp' })
	lastSeen: Date;

	@Column({ nullable: true })
	bio: string;

	@Column({ nullable: true, name: 'position' })
	position: string;

	@Column({ nullable: true, name: 'department' })
	department: string;

	@Column({ nullable: true, name: 'current_project' })
	currentProject: string;

	@Column({ default: true })
	isActive: boolean;

	@Column({ nullable: true })
	twoFactorSecret: string;

	@Column({ default: false })
	twoFactorEnabled: boolean;

	@OneToMany(() => Chat, (chat) => chat.createdBy)
	createdChats: Chat[];

	@ManyToMany(() => Chat, (chat) => chat.members)
	@JoinTable({
		name: 'chat_members',
		joinColumn: { name: 'user_id', referencedColumnName: 'id' },
		inverseJoinColumn: { name: 'chat_id', referencedColumnName: 'id' },
	})
	chats: Chat[];

	@OneToMany(() => Message, (message) => message.sender)
	messages: Message[];

	@OneToMany(() => FriendRequest, (request) => request.sender)
	sentFriendRequests: FriendRequest[];

	@OneToMany(() => FriendRequest, (request) => request.receiver)
	receivedFriendRequests: FriendRequest[];

	@OneToMany(() => PrivacySettings, (settings) => settings.user)
	privacySettings: PrivacySettings[];

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}





