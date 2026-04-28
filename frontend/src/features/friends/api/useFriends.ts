import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { friendApi, CreateFriendRequestDto } from '@/entities/friend'
import { message } from 'antd'

export const useFriends = () => {
	return useQuery({
		queryKey: ['friends'],
		queryFn: async () => {
			const response = await friendApi.getFriends()
			return response.data
		},
	})
}

export const useFriendRequests = () => {
	return useQuery({
		queryKey: ['friendRequests'],
		queryFn: async () => {
			const response = await friendApi.getFriendRequests()
			return response.data
		},
	})
}

export const useSearchUsers = (query: string) => {
	return useQuery({
		queryKey: ['users', 'search', query],
		queryFn: async () => {
			const response = await friendApi.searchUsers(query)
			return response.data
		},
		enabled: query.length > 0,
	})
}

export const useSendFriendRequest = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (data: CreateFriendRequestDto) => friendApi.sendFriendRequest(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['friendRequests'] })
			message.success('Запрос отправлен')
		},
		onError: () => {
			message.error('Ошибка отправки запроса')
		},
	})
}

export const useAcceptFriendRequest = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (id: string) => friendApi.acceptFriendRequest(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['friendRequests'] })
			queryClient.invalidateQueries({ queryKey: ['friends'] })
			message.success('Запрос принят')
		},
	})
}

export const useRejectFriendRequest = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (id: string) => friendApi.rejectFriendRequest(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['friendRequests'] })
			message.success('Запрос отклонен')
		},
	})
}
