import { createBrowserRouter, Navigate, Outlet } from 'react-router'
import {
	LoginPage,
	RegisterPage,
	ChatsPage,
	ChatPage,
	FriendsPage,
	TasksPage,
	SettingsPage,
} from '@/pages'
import { ROUTES, socketManager, NotificationService } from '@/shared/lib'
import { ProtectedRoute } from '../providers/ProtectedRoute'
import { Avatar } from 'antd'
import { useAuth } from '../providers/AuthProvider'
import { UserOutlined } from '@ant-design/icons'
import { getAvatarColor } from '@/shared/lib'
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useLocation, useSearchParams } from 'react-router'

const AppLayout = () => {
	const { user } = useAuth()
	const queryClient = useQueryClient()
	const location = useLocation()
	const [searchParams] = useSearchParams()

	// Запрашиваем разрешение на уведомления при первой загрузке
	useEffect(() => {
		if (!('Notification' in window)) {
			return
		}
		if (Notification.permission === 'default') {
			// Запрашиваем разрешение только если пользователь еще не ответил
			NotificationService.requestPermission()
		}
	}, [])

	// Подключаемся к WebSocket и слушаем новые сообщения для уведомлений
	useEffect(() => {
		if (!user?.id) {
			console.log('[Notifications] No user ID, skipping setup')
			return
		}

		const socket = socketManager.connect(user.id)
		if (!socket) {
			console.log('[Notifications] Socket connection failed')
			return
		}

		console.log('[Notifications] Setting up notification listener for user:', user.id)

		// Обработчик новых сообщений для уведомлений
		const handleNewMessage = (newMessage: any) => {
			console.log('[Notifications] New message received:', {
				messageId: newMessage.id,
				chatId: newMessage.chat?.id,
				senderId: newMessage.sender?.id,
				content: newMessage.content?.substring(0, 50),
			})
			
			// Не показываем уведомления для своих сообщений
			if (newMessage.sender?.id === user.id) {
				console.log('[Notifications] Own message, skipping')
				return
			}

			// Проверяем, открыт ли текущий чат
			const currentChatId = searchParams.get('chat')
			const isCurrentChat = currentChatId === newMessage.chat?.id
			
			console.log('[Notifications] Current chat:', currentChatId, 'Message chat:', newMessage.chat?.id, 'Is current:', isCurrentChat)
			console.log('[Notifications] Document hidden:', document.hidden)
			
			// Не показываем уведомление, если мы находимся в этом чате и вкладка активна
			if (isCurrentChat && !document.hidden) {
				console.log('[Notifications] Current chat is open and tab is active, skipping')
				return
			}

			// Показываем уведомление
			const senderName = newMessage.sender
				? `${newMessage.sender.firstName} ${newMessage.sender.lastName}`.trim() || newMessage.sender.username
				: 'Кто-то'
			const messageText = newMessage.content || 'Новое сообщение'
			
			console.log('[Notifications] Showing notification:', senderName, messageText.substring(0, 30))
			const notification = NotificationService.showMessageNotification(`${senderName}`, {
				body: messageText.length > 100 ? messageText.substring(0, 100) + '...' : messageText,
				tag: `message-${newMessage.chat?.id || 'unknown'}`,
				data: {
					chatId: newMessage.chat?.id,
					messageId: newMessage.id,
				},
				showWhenActive: !isCurrentChat, // Показываем даже когда вкладка активна, если это не текущий чат
			})
			
			if (!notification) {
				console.log('[Notifications] Failed to show notification - check permission or conditions')
			}
		}

		socket.on('new-message', handleNewMessage)
		console.log('[Notifications] Listener attached to socket')

		return () => {
			console.log('[Notifications] Cleaning up notification listener')
			socket.off('new-message', handleNewMessage)
		}
	}, [user?.id, location.pathname, searchParams])

	return (
		<div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--tg-bg-secondary)' }}>
			<header
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'flex-end',
					background: 'var(--tg-bg)',
					borderBottom: '1px solid var(--tg-border)',
					padding: '0 20px',
					height: 56,
					flexShrink: 0,
					zIndex: 100,
				}}
			>
				{user && (
				<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
						<span
							style={{
								color: 'var(--tg-text-primary)',
								fontWeight: 500,
								fontSize: 15,
								lineHeight: 1.2,
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
							}}
						>
							{user.firstName} {user.lastName}
					</span>
						<Avatar
							size={36}
							src={user.avatar}
							style={{
								backgroundColor: user.avatar ? undefined : getAvatarColor(user.id),
								flexShrink: 0,
							}}
					>
							{user.firstName?.[0] || user.username?.[0] || <UserOutlined />}
						</Avatar>
				</div>
				)}
			</header>
			<div style={{ flex: 1, overflow: 'hidden', background: 'var(--tg-bg-secondary)', minHeight: 0 }}>
				<Outlet />
			</div>
		</div>
	)
}

export const router = createBrowserRouter([
	{
		path: ROUTES.login,
		element: <LoginPage />,
	},
	{
		path: ROUTES.register,
		element: <RegisterPage />,
	},
	{
		element: (
			<ProtectedRoute>
				<AppLayout />
			</ProtectedRoute>
		),
		children: [
			{
				path: ROUTES.chats,
				element: <ChatsPage />,
			},
			{
				path: ROUTES.friends,
				element: <FriendsPage />,
			},
			{
				path: ROUTES.tasks,
				element: <TasksPage />,
			},
			{
				path: ROUTES.settings,
				element: <SettingsPage />,
			},
			{
				path: '/',
				element: <Navigate to={ROUTES.chats} replace />,
			},
		],
	},
])
