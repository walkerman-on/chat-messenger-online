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

export enum FriendRequestStatus {
	PENDING = 'pending',
	ACCEPTED = 'accepted',
	REJECTED = 'rejected',
}

@Entity('friend_requests')
export class FriendRequest {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@ManyToOne(() => User, { nullable: false })
	@JoinColumn({ name: 'sender_id' })
	sender: User;

	@ManyToOne(() => User, { nullable: false })
	@JoinColumn({ name: 'receiver_id' })
	receiver: User;

	@Column({ type: 'enum', enum: FriendRequestStatus, default: FriendRequestStatus.PENDING })
	status: FriendRequestStatus;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}






