import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { socketManager } from '@/shared/lib'
import { User } from '../model/types'

export const useUserStatus = (userId: string | undefined) => {
	const queryClient = useQueryClient()
	const [status, setStatus] = useState<'online' | 'offline' | 'away' | undefined>()

	useEffect(() => {
		if (!userId) return

		// Получаем текущий статус из кэша
		const user = queryClient.getQueryData<User>(['user', userId])
		setStatus(user?.status)

		const socket = socketManager.getSocket()
		if (!socket) return

		const handleUserOnline = (data: { userId: string }) => {
			if (data.userId === userId) {
				setStatus('online')
				// Обновляем кэш
				queryClient.setQueryData(['user', userId], (old: User | undefined) => {
					if (!old) return old
					return { ...old, status: 'online' }
				})
				// Обновляем пользователей в чатах
				queryClient.invalidateQueries({ queryKey: ['chats'] })
			}
		}

		const handleUserOffline = (data: { userId: string }) => {
			if (data.userId === userId) {
				setStatus('offline')
				// Обновляем кэш
				queryClient.setQueryData(['user', userId], (old: User | undefined) => {
					if (!old) return old
					return { ...old, status: 'offline' }
				})
				// Обновляем пользователей в чатах
				queryClient.invalidateQueries({ queryKey: ['chats'] })
			}
		}

		socket.on('user-online', handleUserOnline)
		socket.on('user-offline', handleUserOffline)

		return () => {
			socket.off('user-online', handleUserOnline)
			socket.off('user-offline', handleUserOffline)
		}
	}, [userId, queryClient])

	return status
}

