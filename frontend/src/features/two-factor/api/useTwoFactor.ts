import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { twoFactorApi } from '@/entities/two-factor'
import { message } from 'antd'

export const useTwoFactorStatus = () => {
	return useQuery({
		queryKey: ['twoFactor', 'status'],
		queryFn: async () => {
			const response = await twoFactorApi.getStatus()
			return response.data
		},
	})
}

export const useGenerateSecret = () => {
	return useMutation({
		mutationFn: () => twoFactorApi.generateSecret(),
		onError: () => {
			message.error('Ошибка генерации секрета')
		},
	})
}

export const useEnable2FA = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (code: string) => twoFactorApi.enable(code),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['twoFactor'] })
			message.success('Двухфакторная аутентификация включена')
		},
		onError: () => {
			message.error('Неверный код. Проверьте код из приложения Яндекс.Ключ')
		},
	})
}

export const useDisable2FA = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: () => twoFactorApi.disable(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['twoFactor'] })
			message.success('Двухфакторная аутентификация отключена')
		},
		onError: () => {
			message.error('Ошибка отключения 2FA')
		},
	})
}


