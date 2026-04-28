import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { taskApi, CreateTaskDto, TaskStatus } from '@/entities/task'
import { message } from 'antd'

export const useTasks = (chatId: string | undefined) => {
	return useQuery({
		queryKey: ['tasks', chatId],
		queryFn: async () => {
			if (!chatId) throw new Error('Chat ID is required')
			const response = await taskApi.getTasks(chatId)
			return response.data
		},
		enabled: !!chatId,
	})
}

export const useMyTasks = () => {
	return useQuery({
		queryKey: ['tasks', 'my', 'assigned'],
		queryFn: async () => {
			const response = await taskApi.getMyTasks()
			return response.data
		},
	})
}

export const useDelegatedTasks = () => {
	return useQuery({
		queryKey: ['tasks', 'my', 'delegated'],
		queryFn: async () => {
			const response = await taskApi.getDelegatedTasks()
			return response.data
		},
	})
}

export const useCreateTask = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (data: {
			title: string
			description?: string
			assigneeIds: string[]
			dueDate?: string
		}) => {
			return taskApi.createTask({
				...data,
				hashtag: undefined, // Генерируется на бэкенде
				chatId: undefined, // Задачи больше не привязаны к чатам
			})
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['tasks'] })
			message.success('Задача создана')
		},
		onError: () => {
			message.error('Ошибка создания задачи')
		},
	})
}

export const useCompleteTaskByHashtag = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ chatId, hashtag }: { chatId: string; hashtag: string }) =>
			taskApi.completeTaskByHashtag(chatId, hashtag),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ['tasks', variables.chatId] })
			message.success('Задача выполнена')
		},
		onError: () => {
			message.error('Ошибка выполнения задачи')
		},
	})
}

export const useTask = (taskId: string | undefined) => {
	return useQuery({
		queryKey: ['tasks', taskId],
		queryFn: async () => {
			if (!taskId) throw new Error('Task ID is required')
			const response = await taskApi.getTask(taskId)
			return response.data
		},
		enabled: !!taskId,
	})
}

export const useUpdateTaskStatus = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
			taskApi.updateTaskStatus(id, status),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['tasks'] })
		},
	})
}

