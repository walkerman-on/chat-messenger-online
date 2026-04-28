import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { chatApi, CreateChatDto } from '@/entities/chat'
import { message } from 'antd'

export const useChats = () => {
	return useQuery({
		queryKey: ['chats'],
		queryFn: async () => {
			const response = await chatApi.getChats()
			return response.data
		},
	})
}

export const useChat = (id: string | undefined) => {
	return useQuery({
		queryKey: ['chat', id],
		queryFn: async () => {
			if (!id) throw new Error('Chat ID is required')
			const response = await chatApi.getChat(id)
			return response.data
		},
		enabled: !!id,
	})
}

export const useCreateChat = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (data: CreateChatDto) => {
			const response = await chatApi.createChat(data)
			return response.data
		},
		onSuccess: async (newChat) => {
			// Оптимистично обновляем список чатов
			queryClient.setQueryData(['chats'], (oldChats: any[] | undefined) => {
				if (!oldChats) return [newChat]
				// Проверяем, нет ли уже такого чата
				const exists = oldChats.some((chat) => chat.id === newChat.id)
				if (exists) return oldChats
				return [newChat, ...oldChats]
			})
			// Принудительно обновляем список с сервера
			await queryClient.refetchQueries({ queryKey: ['chats'] })
			message.success('Чат создан')
		},
		onError: () => {
			message.error('Ошибка создания чата')
		},
	})
}

export const useDeleteChat = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (chatId: string) => {
			await chatApi.deleteChat(chatId)
			return chatId
		},
		onSuccess: (chatId) => {
			queryClient.setQueryData(['chats'], (oldChats: any[] | undefined) => {
				if (!oldChats) return []
				return oldChats.filter((chat) => chat.id !== chatId)
			})
			queryClient.removeQueries({ queryKey: ['chat', chatId] })
			queryClient.removeQueries({ queryKey: ['messages', chatId] })
			message.success('Чат удален')
		},
		onError: () => {
			message.error('Ошибка удаления чата')
		},
	})
}
