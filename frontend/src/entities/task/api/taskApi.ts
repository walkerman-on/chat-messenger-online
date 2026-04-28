import { http } from '@/shared/api'
import { Task, TaskStatus } from '../model/types'

export interface CreateTaskDto {
	title: string
	description?: string
	hashtag: string
	chatId: string
	assigneeIds?: string[]
	messageId?: string
	dueDate?: string
}

export const taskApi = {
	getTasks: (chatId: string) => http.get<Task[]>(`/tasks/chat/${chatId}`),
	getTask: (id: string) => http.get<Task>(`/tasks/${id}`),
	getMyTasks: () => http.get<Task[]>('/tasks/my/assigned'),
	getDelegatedTasks: () => http.get<Task[]>('/tasks/my/delegated'),
	createTask: (data: CreateTaskDto) => http.post<Task>('/tasks', data),
	updateTaskStatus: (id: string, status: TaskStatus) =>
		http.patch<Task>(`/tasks/${id}/status`, { status }),
	completeTaskByHashtag: (chatId: string, hashtag: string) =>
		http.post<Task>('/tasks/complete', { chatId, hashtag }),
	deleteTask: (id: string) => http.delete(`/tasks/${id}`),
}

