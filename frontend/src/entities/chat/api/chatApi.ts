import { http } from '@/shared/api'
import { Chat, SecurityLevel } from '../model/types'

export interface CreateChatDto {
	name: string
	type: 'private' | 'group'
	memberIds: string[]
	securityLevel?: SecurityLevel
}

export const chatApi = {
	getChats: () => http.get<Chat[]>('/chats'),
	getChat: (id: string) => http.get<Chat>(`/chats/${id}`),
	createChat: (data: CreateChatDto) => http.post<Chat>('/chats', data),
	updateChat: (id: string, data: Partial<Chat>) => http.patch<Chat>(`/chats/${id}`, data),
	deleteChat: (id: string) => http.delete(`/chats/${id}`),
	addMembers: (id: string, memberIds: string[]) =>
		http.post(`/chats/${id}/members`, { memberIds }),
	removeMember: (id: string, memberId: string) =>
		http.delete(`/chats/${id}/members/${memberId}`),
}
