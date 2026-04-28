import { User } from '@/entities/user'
import { Chat } from '@/entities/chat'
import { Message } from '@/entities/message'

export type TaskStatus = 'open' | 'in_progress' | 'completed' | 'cancelled'

export interface Task {
	id: string
	title: string
	description?: string
	hashtag: string
	status: TaskStatus
	chat: Chat
	createdBy: User
	assignees: User[]
	message?: Message
	dueDate?: string
	createdAt: string
	updatedAt: string
}

