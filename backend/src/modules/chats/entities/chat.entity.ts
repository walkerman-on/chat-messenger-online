import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
	OneToMany,
	ManyToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Message } from '../../messages/entities/message.entity';

export enum ChatType {
	PRIVATE = 'private',
	GROUP = 'group',
}

export enum SecurityLevel {
	NONE = 'none',
	COMMERCIAL = 'commercial', // Коммерческая тайна
	STATE = 'state', // Гос. тайна
}

@Entity('chats')
export class Chat {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	name: string;

	@Column({ type: 'enum', enum: ChatType })
	type: ChatType;

	@Column({ nullable: true })
	avatar: string;

	@Column({ type: 'enum', enum: SecurityLevel, default: SecurityLevel.NONE })
	securityLevel: SecurityLevel;

	@ManyToOne(() => User, { nullable: false })
	@JoinColumn({ name: 'created_by' })
	createdBy: User;

	@ManyToMany(() => User, (user) => user.chats)
	members: User[];

	@OneToMany(() => Message, (message) => message.chat)
	messages: Message[];

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}





