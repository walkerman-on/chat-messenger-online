import { useState, useEffect, useMemo } from 'react'
import { Avatar, Typography, Empty, Spin, Input, Dropdown, Modal, Badge } from 'antd'
import { SearchOutlined, MoreOutlined, DeleteOutlined } from '@ant-design/icons'
import { useChats, useDeleteChat } from '@/features/chats'
import { Chat } from '@/entities/chat'
import { User } from '@/entities/user'
import { useProfile } from '@/entities/user'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useSearchParams, useNavigate } from 'react-router'
import { getAvatarColor, getStatusColor, formatLastSeen, getChatAvatar, getChatAvatarColor } from '@/shared/lib'
import { SecurityBadge } from '@/shared/ui'
import { socketManager } from '@/shared/lib'
import { useQueryClient } from '@tanstack/react-query'
import { ROUTES } from '@/shared/lib'

const { Text } = Typography
const { Search } = Input

const getChatName = (chat: Chat, currentUser: User | undefined) => {
	if (chat.type === 'private' && chat.members) {
		const otherUser = chat.members.find((m: User) => m.id !== currentUser?.id)
		return otherUser
			? `${otherUser.firstName} ${otherUser.lastName}`.trim() || otherUser.username
			: chat.name
	}
	return chat.name
}

const getOtherUser = (chat: Chat, currentUser: User | undefined): User | undefined => {
	if (chat.type === 'private' && chat.members) {
		return chat.members.find((m: User) => m.id !== currentUser?.id)
	}
	return undefined
}



export const ChatList = () => {
	const [searchParams, setSearchParams] = useSearchParams()
	const navigate = useNavigate()
	const selectedChatId = searchParams.get('chat')
	const { data: chats, isLoading } = useChats()
	const { data: currentUser } = useProfile()
	const queryClient = useQueryClient()
	const [searchQuery, setSearchQuery] = useState('')
	const deleteChat = useDeleteChat()

	// Подписываемся на события изменения статуса пользователей
	useEffect(() => {
		if (!currentUser?.id) return

		const socket = socketManager.connect(currentUser.id)
		if (!socket) return

		const handleUserOnline = (data: { userId: string }) => {
			// Обновляем статус пользователя в кэше
			queryClient.setQueriesData<Chat[]>({ queryKey: ['chats'] }, (oldChats) => {
				if (!oldChats) return oldChats
				return oldChats.map((chat) => {
					if (chat.members) {
						return {
							...chat,
							members: chat.members.map((member: User) =>
								member.id === data.userId ? { ...member, status: 'online' as const } : member
							),
						}
					}
					return chat
				})
			})
		}

		const handleUserOffline = (data: { userId: string; lastSeen?: string }) => {
			// Обновляем статус пользователя в кэше
			queryClient.setQueriesData<Chat[]>({ queryKey: ['chats'] }, (oldChats) => {
				if (!oldChats) return oldChats
				return oldChats.map((chat) => {
					if (chat.members) {
						return {
							...chat,
							members: chat.members.map((member: User) =>
								member.id === data.userId 
									? { ...member, status: 'offline' as const, lastSeen: data.lastSeen || member.lastSeen } 
									: member
							),
						}
					}
					return chat
				})
			})
		}

		socket.on('user-online', handleUserOnline)
		socket.on('user-offline', handleUserOffline)

		return () => {
			socket.off('user-online', handleUserOnline)
			socket.off('user-offline', handleUserOffline)
		}
	}, [currentUser?.id, queryClient])

	// Фильтруем чаты по поисковому запросу
	const filteredChats = useMemo(() => {
		if (!chats) return []
		if (!searchQuery.trim()) return chats

		const query = searchQuery.toLowerCase()
		return chats.filter((chat: Chat) => {
			const chatName = getChatName(chat, currentUser).toLowerCase()
			if (chatName.includes(query)) return true

			if (chat.type === 'private' && chat.members) {
				const otherUser = getOtherUser(chat, currentUser)
				if (otherUser) {
					const fullName = `${otherUser.firstName} ${otherUser.lastName}`.toLowerCase()
					const username = otherUser.username.toLowerCase()
					return fullName.includes(query) || username.includes(query)
				}
			}

			return false
		})
	}, [chats, searchQuery, currentUser])

	if (isLoading) {
		return (
			<div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
				<Spin />
			</div>
		)
	}

	if (!chats || chats.length === 0) {
		return (
			<div style={{ padding: 40, textAlign: 'center' }}>
				<Empty description="Нет чатов" />
			</div>
		)
	}

	return (
		<div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--tg-bg)' }}>
			<div style={{ padding: 16, borderBottom: '1px solid var(--tg-border)' }}>
				<Search
					placeholder="Поиск чатов..."
					allowClear
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					style={{ borderRadius: 8 }}
					prefix={<SearchOutlined style={{ color: 'var(--tg-text-secondary)' }} />}
				/>
			</div>
			<div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
				{filteredChats.length === 0 ? (
					<div style={{ padding: 40, textAlign: 'center' }}>
						<Empty description="Чаты не найдены" />
					</div>
				) : (
					filteredChats.map((chat: Chat) => {
						const isActive = selectedChatId === chat.id
						const otherUser = getOtherUser(chat, currentUser)
						const status = otherUser?.status

						const handleDeleteChat = (info: { key: string; keyPath: string[]; domEvent: React.MouseEvent }) => {
							// Предотвращаем всплытие события
							if (info.domEvent) {
								info.domEvent.stopPropagation()
							}
							Modal.confirm({
								title: 'Удалить чат?',
								content: 'Вы уверены, что хотите удалить этот чат? Это действие нельзя отменить.',
								okText: 'Удалить',
								cancelText: 'Отмена',
								okButtonProps: { danger: true },
								onOk: () => {
									deleteChat.mutate(chat.id, {
										onSuccess: () => {
											if (selectedChatId === chat.id) {
												navigate(ROUTES.chats)
											}
										},
									})
								},
							})
						}

						const menuItems = [
							{
								key: 'delete',
								label: 'Удалить чат',
								icon: <DeleteOutlined />,
								danger: true,
								onClick: handleDeleteChat,
							},
						]

						return (
							<div
								key={chat.id}
								onClick={() => setSearchParams({ chat: chat.id })}
								className="chat-list-item"
								style={{
									display: 'flex',
									alignItems: 'center',
									padding: '14px 16px',
									cursor: 'pointer',
									borderBottom: '1px solid var(--tg-border)',
									background: isActive ? 'rgba(51, 144, 236, 0.08)' : 'var(--tg-bg)',
									transition: 'all 0.2s ease',
									position: 'relative',
									borderLeft: isActive ? '3px solid #3390ec' : '3px solid transparent',
								}}
								onMouseEnter={(e) => {
									if (!isActive) {
										e.currentTarget.style.background = 'var(--tg-hover)'
									}
									const menuButton = e.currentTarget.querySelector('.chat-menu-button') as HTMLElement
									if (menuButton) {
										menuButton.style.opacity = '1'
									}
								}}
								onMouseLeave={(e) => {
									if (!isActive) {
										e.currentTarget.style.background = 'var(--tg-bg)'
									}
									const menuButton = e.currentTarget.querySelector('.chat-menu-button') as HTMLElement
									if (menuButton) {
										menuButton.style.opacity = '0'
									}
								}}
								onMouseDown={(e) => {
									e.currentTarget.style.transform = 'scale(0.98)'
								}}
								onMouseUp={(e) => {
									e.currentTarget.style.transform = 'scale(1)'
								}}
							>
								<div style={{ flexShrink: 0 }}>
									{chat.type === 'private' ? (
										<Badge status={getStatusColor(status)} offset={[-2, 2]}>
											<Avatar
												size={52}
												style={{
													backgroundColor: getChatAvatarColor(chat, currentUser),
													fontSize: 20,
													fontWeight: 500,
													boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
												}}
											>
												{getChatAvatar(chat, currentUser)}
											</Avatar>
										</Badge>
									) : (
										<Avatar
											size={52}
											style={{
												backgroundColor: getChatAvatarColor(chat, currentUser),
												fontSize: 20,
												fontWeight: 500,
												boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
											}}
										>
											{getChatAvatar(chat, currentUser)}
										</Avatar>
									)}
								</div>
								<div
									style={{
										flex: 1,
										marginLeft: 14,
										minWidth: 0,
										overflow: 'hidden',
									}}
								>
									<div
										style={{
											display: 'flex',
											justifyContent: 'space-between',
											alignItems: 'center',
											marginBottom: 4,
											gap: 8,
										}}
									>
										<div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, flex: 1 }}>
											<Text
												strong
												style={{
													fontSize: 16,
													color: isActive ? '#3390ec' : 'var(--tg-text-primary)',
													overflow: 'hidden',
													textOverflow: 'ellipsis',
													whiteSpace: 'nowrap',
													flex: 1,
													minWidth: 0,
													fontWeight: isActive ? 600 : 500,
												}}
											>
												{getChatName(chat, currentUser)}
											</Text>
										</div>
										<div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
											<SecurityBadge securityLevel={chat.securityLevel} />
											{chat.updatedAt && (
												<Text
													style={{
														fontSize: 12,
														color: isActive ? '#3390ec' : 'var(--tg-text-secondary)',
														fontWeight: isActive ? 500 : 400,
													}}
												>
													{format(new Date(chat.updatedAt), 'HH:mm', { locale: ru })}
												</Text>
											)}
										</div>
									</div>
									{chat.type === 'private' ? (
										otherUser?.status === 'online' ? (
											<Text
												style={{
													fontSize: 13,
													color: '#52c41a',
													overflow: 'hidden',
													textOverflow: 'ellipsis',
													whiteSpace: 'nowrap',
													fontWeight: 500,
												}}
											>
												В сети
											</Text>
										) : otherUser?.lastSeen ? (
											<Text
												style={{
													fontSize: 13,
													color: isActive ? 'var(--tg-text-primary)' : 'var(--tg-text-secondary)',
													overflow: 'hidden',
													textOverflow: 'ellipsis',
													whiteSpace: 'nowrap',
													lineHeight: 1.4,
												}}
											>
												был(а) в сети {formatLastSeen(otherUser.lastSeen)}
											</Text>
										) : (
											<Text
												style={{
													fontSize: 13,
													color: isActive ? 'var(--tg-text-primary)' : 'var(--tg-text-secondary)',
													overflow: 'hidden',
													textOverflow: 'ellipsis',
													whiteSpace: 'nowrap',
													lineHeight: 1.4,
												}}
											>
												Не в сети
											</Text>
										)
									) : (
										<Text
											style={{
												fontSize: 13,
												color: isActive ? 'var(--tg-text-primary)' : 'var(--tg-text-secondary)',
												overflow: 'hidden',
												textOverflow: 'ellipsis',
												whiteSpace: 'nowrap',
												lineHeight: 1.4,
											}}
										>
											Группа
										</Text>
									)}
								</div>
								<Dropdown
									menu={{ items: menuItems }}
									trigger={['click']}
									onClick={(e) => e.stopPropagation()}
								>
									<button
										className="chat-menu-button"
										onClick={(e) => e.stopPropagation()}
										style={{
											position: 'absolute',
											right: 8,
											top: '50%',
											transform: 'translateY(-50%)',
											background: 'transparent',
											border: 'none',
											cursor: 'pointer',
											padding: '4px 8px',
											borderRadius: 4,
											color: 'var(--tg-text-secondary)',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											opacity: 0,
											transition: 'opacity 0.2s',
										}}
									>
										<MoreOutlined style={{ fontSize: 18 }} />
									</button>
								</Dropdown>
							</div>
						)
					})
				)}
			</div>
		</div>
	)
}
