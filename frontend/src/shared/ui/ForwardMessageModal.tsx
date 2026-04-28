import { Modal, List, Avatar, Empty, Input, Typography, Badge } from 'antd'
import { useState } from 'react'
import { useChats } from '@/features/chats'
import { useProfile } from '@/entities/user'
import { Chat } from '@/entities/chat'
import { getAvatarColor, getChatAvatar, getChatAvatarColor, getStatusColor } from '@/shared/lib'
import { Message } from '@/entities/message'

const { Search } = Input
const { Text } = Typography

interface ForwardMessageModalProps {
	visible: boolean
	onClose: () => void
	message: Message | null
	onForward: (chatId: string) => void
	multipleCount?: number
}

export const ForwardMessageModal = ({ visible, onClose, message, onForward, multipleCount }: ForwardMessageModalProps) => {
	const { data: chats } = useChats()
	const { data: currentUser } = useProfile()
	const [searchQuery, setSearchQuery] = useState('')

	const filteredChats = chats?.filter((chat: Chat) => {
		if (!searchQuery) return true
		let chatName = chat.name
		if (chat.type === 'private' && chat.members) {
			const otherUser = chat.members.find((m) => m.id !== currentUser?.id)
			if (otherUser) {
				const fullName = `${otherUser.firstName} ${otherUser.lastName}`.trim()
				chatName = fullName || otherUser.username
			}
		}
		return chatName.toLowerCase().includes(searchQuery.toLowerCase())
	}) || []

	const handleChatSelect = (chatId: string) => {
		if (message?.chat?.id && chatId === message.chat.id) {
			// Нельзя переслать в тот же чат
			return
		}
		onForward(chatId)
		onClose()
		setSearchQuery('')
	}

	return (
		<Modal
			title={multipleCount && multipleCount > 1 ? `Переслать сообщения (${multipleCount})` : 'Переслать сообщение'}
			open={visible}
			onCancel={onClose}
			footer={null}
			width={400}
		>
			<Search
				placeholder="Поиск чата..."
				value={searchQuery}
				onChange={(e) => setSearchQuery(e.target.value)}
				style={{ marginBottom: 16 }}
			/>
			{filteredChats.length === 0 ? (
				<Empty description="Чаты не найдены" />
			) : (
				<List
					dataSource={filteredChats}
					renderItem={(chat: Chat) => {
						const isSameChat = message?.chat?.id && chat.id === message.chat.id
						return (
							<List.Item
								style={{
									cursor: isSameChat ? 'not-allowed' : 'pointer',
									opacity: isSameChat ? 0.5 : 1,
								}}
								onClick={() => !isSameChat && handleChatSelect(chat.id)}
							>
							<List.Item.Meta
								avatar={
									(() => {
										if (chat.type === 'private' && chat.members) {
											const otherUser = chat.members.find((m) => m.id !== currentUser?.id)
											if (otherUser) {
												return (
													<Badge status={getStatusColor(otherUser.status)} offset={[-2, 2]}>
														<Avatar
															size={48}
															src={otherUser.avatar}
															style={{
																backgroundColor: otherUser.avatar ? undefined : getChatAvatarColor(chat, currentUser),
																fontSize: 18,
																fontWeight: 500,
															}}
														>
															{getChatAvatar(chat, currentUser)}
														</Avatar>
													</Badge>
												)
											}
										}
										return (
											<Avatar
												size={48}
												style={{
													backgroundColor: getChatAvatarColor(chat, currentUser),
													fontSize: 18,
													fontWeight: 500,
												}}
											>
												{getChatAvatar(chat, currentUser)}
											</Avatar>
										)
									})()
								}
								title={
									<Text strong>
										{(() => {
											if (chat.type === 'private' && chat.members) {
												const otherUser = chat.members.find((m) => m.id !== currentUser?.id)
												if (otherUser) {
													const fullName = `${otherUser.firstName} ${otherUser.lastName}`.trim()
													return fullName || otherUser.username
												}
											}
											return chat.name
										})()}
									</Text>
								}
								description={
									(() => {
										if (chat.type === 'private' && chat.members) {
											const otherUser = chat.members.find((m) => m.id !== currentUser?.id)
											if (otherUser) {
												return (
													<Badge 
														status={getStatusColor(otherUser.status)} 
														text={
															otherUser.status === 'online'
																? 'В сети'
																: otherUser.status === 'away'
																	? 'Отошёл'
																	: 'Не в сети'
														}
													/>
												)
											}
										}
										return chat.type === 'group' ? 'Группа' : ''
									})()
								}
								/>
							</List.Item>
						)
					}}
				/>
			)}
		</Modal>
	)
}

