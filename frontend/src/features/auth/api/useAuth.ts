import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi, LoginDto, RegisterDto } from './authApi'
import { ROUTES } from '@/shared/lib'
import { message } from 'antd'
import { useNavigate } from 'react-router'

export const useLogin = () => {
	const queryClient = useQueryClient()
	const navigate = useNavigate()

	return useMutation({
		mutationFn: (data: LoginDto) => authApi.login(data),
		onSuccess: (response) => {
			localStorage.setItem('accessToken', response.data.accessToken)
			localStorage.setItem('refreshToken', response.data.refreshToken)
			queryClient.setQueryData(['user', 'profile'], response.data.user)
			queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })
			message.success('Вход выполнен успешно')
			navigate(ROUTES.chats, { replace: true })
		},
		onError: (error: any) => {
			const errorMessage = error?.response?.data?.message || 'Неверный email или пароль'
			message.error(errorMessage)
			console.error('Login error:', error)
		},
	})
}

export const useRegister = () => {
	const queryClient = useQueryClient()
	const navigate = useNavigate()

	return useMutation({
		mutationFn: (data: RegisterDto) => authApi.register(data),
		onSuccess: (response) => {
			localStorage.setItem('accessToken', response.data.accessToken)
			localStorage.setItem('refreshToken', response.data.refreshToken)
			queryClient.setQueryData(['user', 'profile'], response.data.user)
			queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })
			message.success('Регистрация выполнена успешно')
			navigate(ROUTES.chats, { replace: true })
		},
		onError: (error: any) => {
			const errorMessage = error?.response?.data?.message || 'Ошибка регистрации'
			message.error(errorMessage)
			console.error('Register error:', error)
		},
	})
}

export const useLogout = () => {
	const queryClient = useQueryClient()

	return () => {
		localStorage.removeItem('accessToken')
		localStorage.removeItem('refreshToken')
		queryClient.clear()
		window.location.href = ROUTES.login
	}
}
