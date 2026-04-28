import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { messageApi, CreateMessageDto, UpdateMessageDto } from '@/entities/message'
import { message as antdMessage } from 'antd'

export const useMessages = (chatId: string | undefined) => {
	return useQuery({
		queryKey: ['messages', chatId],
		queryFn: async () => {
			if (!chatId) throw new Error('Chat ID is required')
			const response = await messageApi.getMessages(chatId)
			// Бэкенд автоматически помечает сообщения как прочитано при загрузке
			// Данные уже содержат обновленные статусы из БД
			return response.data
		},
		enabled: !!chatId,
		// Не кэшируем данные, чтобы всегда получать актуальные статусы
		staleTime: 0,
	})
}

export const useSendMessage = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (data: CreateMessageDto) => messageApi.createMessage(data),
		onSuccess: (response, variables) => {
			// Оптимистично добавляем новое сообщение в кэш
			queryClient.setQueryData(['messages', variables.chatId], (oldData: any) => {
				if (!oldData) return [response.data]
				return [...oldData, response.data]
			})
			// Обновляем список чатов
			queryClient.invalidateQueries({ queryKey: ['chats'] })
		},
		onError: () => {
			antdMessage.error('Ошибка отправки сообщения')
		},
	})
}

export const useDeleteMessage = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (messageId: string) => messageApi.deleteMessage(messageId),
		onSuccess: (_, messageId) => {
			queryClient.setQueriesData<any[]>({ queryKey: ['messages'] }, (oldData) => {
				if (!oldData) return oldData
				return oldData.filter((msg) => msg.id !== messageId)
			})
			antdMessage.success('Сообщение удалено')
		},
		onError: () => {
			antdMessage.error('Ошибка удаления сообщения')
		},
	})
}

export const useDeleteChatMessages = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (chatId: string) => messageApi.deleteChatMessages(chatId),
		onSuccess: (_, chatId) => {
			queryClient.setQueryData(['messages', chatId], [])
			queryClient.invalidateQueries({ queryKey: ['chats'] })
			antdMessage.success('Переписка удалена')
		},
		onError: () => {
			antdMessage.error('Ошибка удаления переписки')
		},
	})
}

export const useUpdateMessage = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateMessageDto }) =>
			messageApi.updateMessage(id, data),
		onSuccess: (response, variables) => {
			// Обновляем сообщение в кэше
			queryClient.setQueriesData<any[]>({ queryKey: ['messages'] }, (oldData) => {
				if (!oldData) return oldData
				return oldData.map((msg) =>
					msg.id === variables.id ? { ...msg, ...response.data, editedAt: response.data.editedAt } : msg
				)
			})
			// Обновляем список чатов
			queryClient.invalidateQueries({ queryKey: ['chats'] })
			antdMessage.success('Сообщение отредактировано')
		},
		onError: () => {
			antdMessage.error('Ошибка редактирования сообщения')
		},
	})
}
