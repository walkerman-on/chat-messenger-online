import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { http } from '@/shared/api'
import { message } from 'antd'

export interface PrivacySettings {
	whoCanMessageMe: 'everyone' | 'friends'
	allowFriendRequests?: boolean
	showOnlineStatus?: boolean
	showReadReceipts?: boolean
}

export const usePrivacySettings = () => {
	return useQuery({
		queryKey: ['privacySettings'],
		queryFn: async () => {
			const response = await http.get<PrivacySettings>('/settings')
			return response.data
		},
	})
}

export const useUpdatePrivacySettings = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (data: PrivacySettings) =>
			http.patch<PrivacySettings>('/settings', data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['privacySettings'] })
			message.success('Настройки обновлены')
		},
		onError: () => {
			message.error('Ошибка обновления настроек')
		},
	})
}
