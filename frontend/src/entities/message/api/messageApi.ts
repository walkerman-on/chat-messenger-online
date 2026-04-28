import { http } from '@/shared/api'
import { Message } from '../model/types'

export interface CreateMessageDto {
	type: 'text' | 'audio' | 'image' | 'file'
	content?: string
	fileUrl?: string
	forwardedFromId?: string
	chatId: string
}

export interface UpdateMessageDto {
	content?: string
}

export const messageApi = {
	getMessages: (chatId: string, limit?: number, offset?: number) => {
		const params = new URLSearchParams()
		if (limit) params.append('limit', limit.toString())
		if (offset) params.append('offset', offset.toString())
		const query = params.toString()
		return http.get<Message[]>(`/messages/chat/${chatId}${query ? `?${query}` : ''}`)
	},
	createMessage: (data: CreateMessageDto) => http.post<Message>('/messages', data),
	updateMessage: (id: string, data: UpdateMessageDto) => http.patch<Message>(`/messages/${id}`, data),
	deleteMessage: (id: string) => http.delete(`/messages/${id}`),
	deleteChatMessages: (chatId: string) => http.delete(`/messages/chat/${chatId}`),
	markAsRead: (id: string) => http.patch(`/messages/${id}/read`),
}
