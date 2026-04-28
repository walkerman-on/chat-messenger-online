import { Chat } from '@/entities/chat'
import { User } from '@/entities/user'
import { getAvatarColor } from './avatar-colors'

export const getChatAvatar = (chat: Chat, currentUser: User | undefined) => {
	if (chat.type === 'private' && chat.members) {
		const otherUser = chat.members.find((m: User) => m.id !== currentUser?.id)
		return otherUser?.firstName?.[0] || chat.name[0]
	}
	return chat.name[0]
}

export const getChatAvatarColor = (chat: Chat, currentUser: User | undefined) => {
	if (chat.type === 'private' && chat.members) {
		const otherUser = chat.members.find((m: User) => m.id !== currentUser?.id)
		if (otherUser) {
			return getAvatarColor(otherUser.id)
		}
	}
	return getAvatarColor(chat.id)
}

