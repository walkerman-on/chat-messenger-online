import { useMutation, useQueryClient } from '@tanstack/react-query'
import { userApi } from './userApi'
import { User } from '../model/types'
import { message } from 'antd'

export const useUpdateProfile = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (data: Partial<User>) => userApi.updateProfile(data),
		onSuccess: (response) => {
			queryClient.setQueryData(['user', 'profile'], response.data)
			queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })
			message.success('Профиль обновлен')
		},
		onError: () => {
			message.error('Ошибка обновления профиля')
		},
	})
}

