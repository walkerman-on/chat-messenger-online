import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
	OneToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum MessagePrivacy {
	EVERYONE = 'everyone',
	FRIENDS = 'friends',
}

@Entity('privacy_settings')
export class PrivacySettings {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@OneToOne(() => User, { nullable: false })
	@JoinColumn({ name: 'user_id' })
	user: User;

	@Column({ type: 'enum', enum: MessagePrivacy, default: MessagePrivacy.EVERYONE })
	whoCanMessageMe: MessagePrivacy;

	@Column({ default: true })
	allowFriendRequests: boolean;

	@Column({ default: true })
	showOnlineStatus: boolean;

	@Column({ default: true })
	showReadReceipts: boolean;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}






