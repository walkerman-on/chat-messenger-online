import { User } from '@/entities/user'
import { Chat } from '@/entities/chat'

export type MessageType = 'text' | 'audio' | 'image' | 'file'
export type MessageStatus = 'sent' | 'delivered' | 'read'

export interface Message {
	id: string
	type: MessageType
	content?: string
	fileUrl?: string
	forwardedFromId?: string
	forwardedFrom?: Message
	status: MessageStatus
	sender: User
	chat: Chat
	createdAt: string
	updatedAt: string
	editedAt?: string
}
