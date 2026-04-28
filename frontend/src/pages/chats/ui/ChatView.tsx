import { Input, Button, Alert, Dropdown, Modal, Avatar, Badge } from 'antd'
import { MessageList } from '@/widgets/message-list'
import { useChat } from '@/features/chats'
import { useSendMessage, useDeleteChatMessages } from '@/features/messages'
import { useState, useEffect, useRef } from 'react'
import { socketManager, getAvatarColor, getStatusColor, NotificationService } from '@/shared/lib'
import { useQueryClient } from '@tanstack/react-query'
import { useProfile, User } from '@/entities/user'
import { SendOutlined, ExclamationCircleOutlined, MoreOutlined, DeleteOutlined } from '@ant-design/icons'
import { EmojiPickerButton, SecurityProtection, SecurityBadge, SecurityWarning, UserProfileModal } from '@/shared/ui'
import { userApi } from '@/entities/user'
import { useQuery } from '@tanstack/react-query'

const { TextArea } = Input

interface ChatViewProps {
	chatId: string
}

export const ChatView = ({ chatId }: ChatViewProps) => {
	const { data: chat } = useChat(chatId)
	const { data: currentUser } = useProfile()
	const sendMessage = useSendMessage()
	const deleteChatMessages = useDeleteChatMessages()
	const queryClient = useQueryClient()
	const [message, setMessage] = useState('')
	const textAreaRef = useRef<any>(null)
	const [showSecurityWarning, setShowSecurityWarning] = useState(false)
	const [hasAcceptedSecurity, setHasAcceptedSecurity] = useState(false)
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
	
	const { data: selectedUser } = useQuery({
		queryKey: ['user', selectedUserId],
		queryFn: async () => {
			if (!selectedUserId) return null
			const response = await userApi.getUser(selectedUserId)
			return response.data
		},
		enabled: !!selectedUserId,
	})

	// Показываем предупреждение при первом открытии секретного чата
	useEffect(() => {
		if (chat?.securityLevel && chat.securityLevel !== 'none' && !hasAcceptedSecurity) {
			setShowSecurityWarning(true)
		}
	}, [chat?.securityLevel, hasAcceptedSecurity])

	// Запрашиваем разрешение на уведомления при первой загрузке
	useEffect(() => {
		if (NotificationService.hasPermission()) {
			return
		}
		// Запрашиваем разрешение только если пользователь еще не ответил
		if (Notification.permission === 'default') {
			// Можно показать подсказку пользователю перед запросом
			// Пока просто запрашиваем автоматически
			NotificationService.requestPermission()
		}
	}, [])

	useEffect(() => {
		if (!currentUser?.id || !chatId) return

		const socket = socketManager.connect(currentUser.id)
		if (!socket) return

		socket.emit('join-chat', { chatId })

		// Обновляем только при получении сообщения от другого пользователя
		// Свое сообщение уже добавлено оптимистично в useSendMessage
		const handleNewMessage = (newMessage: any) => {
			// Если это наше сообщение, не обновляем (оно уже в кэше)
			if (newMessage.sender?.id === currentUser?.id) {
				return
			}
			queryClient.invalidateQueries({ queryKey: ['messages', chatId] })
			queryClient.invalidateQueries({ queryKey: ['chats'] })

			// Показываем уведомление о новом сообщении
			// Только если это не текущий открытый чат или вкладка неактивна
			if (newMessage.chat?.id !== chatId || document.hidden) {
				const senderName = newMessage.sender
					? `${newMessage.sender.firstName} ${newMessage.sender.lastName}`.trim() || newMessage.sender.username
					: 'Кто-то'
				const messageText = newMessage.content || 'Новое сообщение'
				
				NotificationService.showMessageNotification(`${senderName}`, {
					body: messageText.length > 100 ? messageText.substring(0, 100) + '...' : messageText,
					tag: `message-${newMessage.chat?.id || 'unknown'}`,
					data: {
						chatId: newMessage.chat?.id,
						messageId: newMessage.id,
					},
					showWhenActive: newMessage.chat?.id !== chatId, // Показываем даже когда вкладка активна, если это другой чат
				})
			}
		}

		// Для статусов используем setQueryData для оптимистичного обновления
		// Обновляем только сообщения других пользователей
		const handleMessagesDelivered = (data: { chatId: string; userId: string }) => {
			// Обновляем статусы только если это не наш пользователь
			if (data.userId === currentUser?.id) return

			queryClient.setQueryData(['messages', chatId], (oldData: any) => {
				if (!oldData) return oldData
				return oldData.map((msg: any) =>
					msg.sender.id !== currentUser?.id && msg.status === 'sent'
						? { ...msg, status: 'delivered' }
						: msg
				)
			})
		}

		const handleMessagesDeleted = (data: { chatId: string }) => {
			if (data.chatId === chatId) {
				queryClient.setQueryData(['messages', chatId], [])
			}
		}

		const handleMessageDeleted = (data: { messageId: string; chatId: string }) => {
			if (data.chatId === chatId) {
				queryClient.setQueriesData<any[]>({ queryKey: ['messages'] }, (oldData) => {
					if (!oldData) return oldData
					return oldData.filter((msg) => msg.id !== data.messageId)
				})
			}
		}

		socket.on('new-message', handleNewMessage)
		socket.on('messages-delivered', handleMessagesDelivered)
		socket.on('messages-deleted', handleMessagesDeleted)
		socket.on('message-deleted', handleMessageDeleted)
		
		const handleMessageUpdated = (updatedMessage: any) => {
			queryClient.setQueriesData<any[]>({ queryKey: ['messages'] }, (oldData) => {
				if (!oldData) return oldData
				return oldData.map((msg) =>
					msg.id === updatedMessage.id ? { ...msg, ...updatedMessage } : msg
				)
			})
		}
		
		socket.on('message-updated', handleMessageUpdated)

		return () => {
			socket.off('new-message', handleNewMessage)
			socket.off('messages-delivered', handleMessagesDelivered)
			socket.off('messages-deleted', handleMessagesDeleted)
			socket.off('message-deleted', handleMessageDeleted)
			socket.off('message-updated', handleMessageUpdated)
		}
		// queryClient стабилен, не нужно добавлять в зависимости
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentUser?.id, chatId])

	const handleSend = () => {
		if (!message.trim() || !chatId) return

		sendMessage.mutate(
			{
				type: 'text',
				content: message,
				chatId: chatId,
			},
			{
				onSuccess: () => {
					setMessage('')
				},
			}
		)
	}

	const handleEmojiClick = (emoji: string) => {
		const textArea = textAreaRef.current?.resizableTextArea?.textArea
		if (textArea) {
			const start = textArea.selectionStart || 0
			const end = textArea.selectionEnd || 0
			const newMessage = message.substring(0, start) + emoji + message.substring(end)
			setMessage(newMessage)
			// Устанавливаем курсор после вставленного emoji
			setTimeout(() => {
				textArea.focus()
				textArea.setSelectionRange(start + emoji.length, start + emoji.length)
			}, 0)
		} else {
			setMessage(message + emoji)
		}
	}

	const getChatName = () => {
		if (!chat || !currentUser) return 'Чат'
		if (chat.type === 'private' && chat.members) {
			const otherUser = chat.members.find((m: User) => m.id !== currentUser.id)
			return otherUser
				? `${otherUser.firstName} ${otherUser.lastName}`.trim() || otherUser.username
				: chat.name
		}
		return chat.name
	}

	const getOtherUser = () => {
		if (!chat || !currentUser || chat.type !== 'private') return null
		return chat.members?.find((m: User) => m.id !== currentUser.id) || null
	}

	const handleSecurityWarningConfirm = () => {
		setHasAcceptedSecurity(true)
		setShowSecurityWarning(false)
	}

	const handleSecurityWarningCancel = () => {
		setShowSecurityWarning(false)
		// Можно добавить логику возврата к списку чатов
	}

	const handleDeleteMessages = () => {
		Modal.confirm({
			title: 'Удалить переписку?',
			content: 'Вы уверены, что хотите удалить всю переписку в этом чате? Это действие нельзя отменить.',
			okText: 'Удалить',
			cancelText: 'Отмена',
			okButtonProps: { danger: true },
			onOk: () => {
				deleteChatMessages.mutate(chatId)
			},
		})
	}

	const menuItems = [
		{
			key: 'delete-messages',
			label: 'Удалить переписку',
			icon: <DeleteOutlined />,
			danger: true,
			onClick: handleDeleteMessages,
		},
	]

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				height: '100%',
				width: '100%',
				background: 'var(--tg-bg-secondary)',
				minHeight: 0,
			}}
		>
			<SecurityWarning
				securityLevel={chat?.securityLevel}
				visible={showSecurityWarning}
				onConfirm={handleSecurityWarningConfirm}
				onCancel={handleSecurityWarningCancel}
			/>
			<div
				style={{
					background: 'var(--tg-bg)',
					display: 'flex',
					flexDirection: 'column',
					borderBottom: '1px solid var(--tg-border)',
					boxShadow: 'var(--tg-shadow)',
				}}
			>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						gap: 12,
						padding: '0 16px',
						minHeight: 56,
					}}
				>
					<div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
						{chat?.type === 'private' && getOtherUser() && (
							<Badge status={getStatusColor(getOtherUser()?.status)} offset={[-2, 2]}>
								<Avatar
									size={36}
									src={getOtherUser()?.avatar}
									style={{
										backgroundColor: getOtherUser()?.avatar ? undefined : getAvatarColor(getOtherUser()!.id),
										cursor: 'pointer',
										flexShrink: 0,
									}}
									onClick={() => setSelectedUserId(getOtherUser()!.id)}
								>
									{getOtherUser()?.firstName?.[0] || getOtherUser()?.username?.[0]}
								</Avatar>
							</Badge>
						)}
						<h3
							style={{
								margin: 0,
								fontSize: 16,
								fontWeight: 500,
								color: 'var(--tg-text-primary)',
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
							}}
						>
							{getChatName()}
						</h3>
						<SecurityBadge securityLevel={chat?.securityLevel} />
					</div>
					<Dropdown menu={{ items: menuItems }} trigger={['click']}>
						<Button
							type="text"
							icon={<MoreOutlined />}
							style={{
								color: 'var(--tg-text-secondary)',
								flexShrink: 0,
							}}
						/>
					</Dropdown>
				</div>
				{chat?.securityLevel && chat.securityLevel !== 'none' && (
					<Alert
						message={
							<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
								<ExclamationCircleOutlined />
								<span>
									{chat.securityLevel === 'state'
										? 'Гос. тайна: Скриншоты запрещены. Все действия логируются.'
										: 'Коммерческая тайна: Скриншоты запрещены. Все действия логируются.'}
								</span>
							</div>
						}
						type={chat.securityLevel === 'state' ? 'error' : 'warning'}
						showIcon={false}
						closable={false}
						style={{
							borderRadius: 0,
							borderLeft: 'none',
							borderRight: 'none',
							borderTop: '1px solid var(--tg-border)',
							borderBottom: 'none',
							padding: '8px 16px',
							fontSize: 12,
						}}
					/>
				)}
			</div>
			<SecurityProtection securityLevel={chat?.securityLevel} chatId={chatId}>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						flex: 1,
						overflow: 'hidden',
						background: 'var(--tg-bg-secondary)',
						minHeight: 0,
					}}
				>
					<div style={{ flex: 1, overflow: 'auto', background: 'var(--tg-bg-secondary)', minHeight: 0 }}>
						<MessageList chatId={chatId} />
					</div>
					<div
						style={{
							padding: '8px 12px',
							background: 'var(--tg-bg)',
							borderTop: '1px solid var(--tg-border)',
							flexShrink: 0,
							position: 'relative',
							zIndex: 100,
						}}
					>
						<div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
							<EmojiPickerButton onEmojiClick={handleEmojiClick} />
							<TextArea
								ref={textAreaRef}
								value={message}
								onChange={(e) => setMessage(e.target.value)}
								placeholder="Введите сообщение..."
								autoSize={{ minRows: 1, maxRows: 4 }}
								onPressEnter={(e) => {
									if (!e.shiftKey) {
										e.preventDefault()
										handleSend()
									}
								}}
								style={{
									flex: 1,
									borderRadius: 20,
									padding: '8px 16px',
									fontSize: 15,
									lineHeight: 1.5,
									resize: 'none',
									background: 'var(--tg-bg-secondary)',
									border: '1px solid var(--tg-border)',
								}}
								styles={{
									textarea: {
										background: 'var(--tg-bg-secondary)',
										color: 'var(--tg-text-primary)',
									},
								}}
							/>
							<Button
								type="primary"
								icon={<SendOutlined />}
								onClick={handleSend}
								loading={sendMessage.isPending}
								disabled={!message.trim()}
								style={{
									background: message.trim() ? '#3390ec' : 'var(--tg-text-secondary)',
									borderColor: message.trim() ? '#3390ec' : 'var(--tg-border)',
									borderRadius: '50%',
									width: 40,
									height: 40,
									minWidth: 40,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									flexShrink: 0,
									position: 'relative',
									zIndex: 10,
									padding: 0,
								}}
							/>
						</div>
					</div>
				</div>
			</SecurityProtection>
			<UserProfileModal
				user={selectedUser || null}
				visible={!!selectedUserId}
				onClose={() => setSelectedUserId(null)}
			/>
		</div>
	)
}
