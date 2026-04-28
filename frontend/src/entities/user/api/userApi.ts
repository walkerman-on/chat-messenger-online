import { http } from '@/shared/api'
import { User } from '../model/types'

export const userApi = {
	getProfile: () => http.get<User>('/users/me'),
	getUser: (id: string) => http.get<User>(`/users/${id}`),
	getAllUsers: () => http.get<User[]>('/users'),
	updateProfile: (data: Partial<User>) => http.patch<User>('/users/me', data),
	uploadAvatar: (file: File) => {
		const formData = new FormData()
		formData.append('avatar', file)
		return http.post<{ url: string }>('/users/me/avatar', formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
		})
	},
}
