import { useState } from 'react'
import { Avatar, Typography, Empty, Spin, Badge, Dropdown, message as antdMessage, Checkbox, Button, Modal, Input } from 'antd'
import { getAvatarColor, getStatusColor } from '@/shared/lib'
import { useMessages, useSendMessage, useUpdateMessage, useDeleteMessage } from '@/features/messages'
import { Message } from '@/entities/message'
import { useProfile } from '@/entities/user'
import { useChat } from '@/features/chats'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { CheckOutlined, CheckCircleOutlined, ShareAltOutlined, MoreOutlined, CloseOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { MessageText, UserProfileModal, ForwardMessageModal } from '@/shared/ui'
import { userApi } from '@/entities/user'
import { useQuery } from '@tanstack/react-query'

const { Text } = Typography

const getStatusIcon = (status: string) => {
	switch (status) {
		case 'read':
			return <CheckCircleOutlined style={{ fontSize: 12, color: '#3390ec' }} />
		case 'delivered':
			return <CheckCircleOutlined style={{ fontSize: 12, color: 'var(--tg-text-secondary)' }} />
		case 'sent':
			return <CheckOutlined style={{ fontSize: 12, color: 'var(--tg-text-secondary)' }} />
		default:
			return null
	}
}

export const MessageList = ({ chatId }: { chatId: string }) => {
	const { data: messages, isLoading } = useMessages(chatId)
	const { data: currentUser } = useProfile()
	const { data: chat } = useChat(chatId)
	const sendMessage = useSendMessage()
	const updateMessage = useUpdateMessage()
	const deleteMessage = useDeleteMessage()
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
	const [forwardMessage, setForwardMessage] = useState<Message | null>(null)
	const [editingMessage, setEditingMessage] = useState<Message | null>(null)
	const [editContent, setEditContent] = useState('')
	const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set())
	const [isSelectionMode, setIsSelectionMode] = useState(false)

	const { data: selectedUser } = useQuery({
		queryKey: ['user', selectedUserId],
		queryFn: async () => {
			if (!selectedUserId) return null
			const response = await userApi.getUser(selectedUserId)
			return response.data
		},
		enabled: !!selectedUserId,
	})

	const handleToggleMessage = (messageId: string) => {
		setSelectedMessages(prev => {
			const newSet = new Set(prev)
			if (newSet.has(messageId)) {
				newSet.delete(messageId)
			} else {
				newSet.add(messageId)
			}
			return newSet
		})
	}

	const handleSelectAll = () => {
		if (selectedMessages.size === messages?.length) {
			setSelectedMessages(new Set())
		} else {
			setSelectedMessages(new Set(messages?.map(m => m.id) || []))
		}
	}

	const handleForward = (targetChatId: string) => {
		if (selectedMessages.size > 0) {
			// Пересылаем несколько сообщений
			const messagesToForward = messages?.filter(m => selectedMessages.has(m.id)) || []

			// Запрещаем пересылку из чатов с грифом секретности
			if (chat?.securityLevel && chat.securityLevel !== 'none') {
				antdMessage.info(
					chat.securityLevel === 'state'
						? 'Пересылка сообщений из чатов с грифом "Гос. тайна" запрещена'
						: 'Пересылка сообщений из чатов с грифом "Коммерческая тайна" запрещена'
				)
				return
			}

			let successCount = 0
			let errorCount = 0
			const totalMessages = messagesToForward.length

			// Пересылаем сообщения
			messagesToForward.forEach((msg) => {
				sendMessage.mutate({
					type: msg.type,
					content: msg.content,
					fileUrl: msg.fileUrl,
					forwardedFromId: msg.id,
					chatId: targetChatId,
				}, {
					onSuccess: () => {
						successCount++
						if (successCount + errorCount === totalMessages) {
							// Все сообщения обработаны
							if (errorCount === 0) {
								antdMessage.success(`Переслано сообщений: ${successCount}`)
							} else if (successCount === 0) {
								antdMessage.error('Ошибка пересылки сообщений')
							} else {
								antdMessage.info(`Переслано: ${successCount}, ошибок: ${errorCount}`)
							}
							setSelectedMessages(new Set())
							setIsSelectionMode(false)
							setForwardMessage(null)
						}
					},
					onError: () => {
						errorCount++
						if (successCount + errorCount === totalMessages) {
							// Все сообщения обработаны
							if (errorCount === totalMessages) {
								antdMessage.error('Ошибка пересылки сообщений')
							} else {
								antdMessage.info(`Переслано: ${successCount}, ошибок: ${errorCount}`)
							}
							setSelectedMessages(new Set())
							setIsSelectionMode(false)
							setForwardMessage(null)
						}
					},
				})
			})
		} else if (forwardMessage) {
			// Пересылаем одно сообщение (старый способ)
			sendMessage.mutate({
				type: forwardMessage.type,
				content: forwardMessage.content,
				fileUrl: forwardMessage.fileUrl,
				forwardedFromId: forwardMessage.id,
				chatId: targetChatId,
			}, {
				onSuccess: () => {
					antdMessage.success('Сообщение переслано')
					setForwardMessage(null)
				},
				onError: () => {
					antdMessage.error('Ошибка пересылки сообщения')
				},
			})
		}
	}

	if (isLoading) {
		return (
			<div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
				<Spin />
			</div>
		)
	}

	if (!messages || messages.length === 0) {
		return (
			<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
				<Empty description="Нет сообщений" />
			</div>
		)
	}

	return (
		<div
			style={{
				padding: '16px 16px 0',
				display: 'flex',
				flexDirection: 'column',
				gap: 8,
			}}
		>
			{messages.map((message: Message, index: number) => {
				const isOwn = message.sender.id === currentUser?.id
				const isPrivateChat = chat?.type === 'private'
				const prevMessage = index > 0 ? messages[index - 1] : null
				const showAvatar =
					!prevMessage ||
					prevMessage.sender.id !== message.sender.id ||
					new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime() > 300000
				// В личных чатах не показываем имя отправителя, так как это очевидно из контекста
				const showSenderName = !isOwn && showAvatar && !isPrivateChat

				return (
					<div
						key={message.id}
						style={{
							display: 'flex',
							justifyContent: isOwn ? 'flex-end' : 'flex-start',
							marginBottom: showAvatar ? 12 : 4,
						}}
					>
						<div
							style={{
								display: 'flex',
								flexDirection: isOwn ? 'row-reverse' : 'row',
								gap: 8,
								maxWidth: '70%',
								alignItems: 'flex-end',
							}}
						>
							{isSelectionMode && (
								<Checkbox
									checked={selectedMessages.has(message.id)}
									onChange={() => handleToggleMessage(message.id)}
									style={{ marginRight: 8, flexShrink: 0 }}
								/>
							)}
							{showAvatar && !isOwn && (
								<Badge status={getStatusColor(message.sender.status)} offset={[-2, 2]}>
									<Avatar
										size={32}
										style={{
											backgroundColor: getAvatarColor(message.sender.id),
											flexShrink: 0,
											cursor: isSelectionMode ? 'default' : 'pointer',
										}}
										onClick={() => !isSelectionMode && setSelectedUserId(message.sender.id)}
									>
										{message.sender.firstName[0]}
									</Avatar>
								</Badge>
							)}
							{showAvatar && isOwn && <div style={{ width: 32 }} />}
							<Dropdown
								menu={{
									items: [
										{
											key: 'select',
											label: isSelectionMode ? 'Отменить выбор' : 'Выбрать сообщения',
											icon: <CheckCircleOutlined />,
											onClick: () => {
												setIsSelectionMode(!isSelectionMode)
												if (isSelectionMode) {
													setSelectedMessages(new Set())
												}
											},
										},
										...(isOwn && message.type === 'text' && message.content
											? [
													{
														key: 'edit',
														label: 'Редактировать',
														icon: <EditOutlined />,
														onClick: () => {
															setEditingMessage(message)
															setEditContent(message.content || '')
														},
													},
												]
											: []),
										...(isOwn
											? [
													{
														key: 'delete',
														label: 'Удалить',
														icon: <DeleteOutlined />,
														danger: true,
														onClick: () => {
															Modal.confirm({
																title: 'Удалить сообщение?',
																content: 'Вы уверены, что хотите удалить это сообщение?',
																okText: 'Удалить',
																okType: 'danger',
																cancelText: 'Отмена',
																onOk: () => {
																	deleteMessage.mutate(message.id)
																},
															})
														},
													},
												]
											: []),
										{
											key: 'forward',
											label: 'Переслать',
											icon: <ShareAltOutlined />,
											onClick: () => {
												// Запрещаем пересылку из чатов с грифом секретности
												if (chat?.securityLevel && chat.securityLevel !== 'none') {
													antdMessage.info(
														chat.securityLevel === 'state'
															? 'Пересылка сообщений из чатов с грифом "Гос. тайна" запрещена'
															: 'Пересылка сообщений из чатов с грифом "Коммерческая тайна" запрещена'
													)
													return
												}
												setForwardMessage(message)
											},
											disabled: chat?.securityLevel && chat.securityLevel !== 'none',
										},
									],
								}}
								trigger={['contextMenu']}
							>
								<div
									style={{
										backgroundColor: isOwn ? 'var(--tg-message-own)' : 'var(--tg-message-other)',
										borderRadius: isOwn ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
										padding: '8px 12px',
										boxShadow: 'var(--tg-shadow)',
										position: 'relative',
										border: selectedMessages.has(message.id) ? '2px solid #3390ec' : 'none',
										opacity: isSelectionMode && !selectedMessages.has(message.id) ? 0.6 : 1,
										cursor: isSelectionMode ? 'pointer' : 'default',
									}}
									onClick={() => {
										if (isSelectionMode) {
											handleToggleMessage(message.id)
										}
									}}
								>
									{message.forwardedFrom && (
										<div
											style={{
												padding: '6px 8px',
												background: 'rgba(0, 0, 0, 0.05)',
												borderRadius: 6,
												marginBottom: 6,
												borderLeft: '3px solid var(--tg-blue)',
											}}
										>
											<div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
												<Text
													style={{
														fontSize: 12,
														color: 'var(--tg-blue)',
														fontWeight: 500,
													}}
												>
													Переслано от {message.forwardedFrom.sender.firstName} {message.forwardedFrom.sender.lastName}
												</Text>
												{message.forwardedFrom.sender.status && (
													<Badge
														status={getStatusColor(message.forwardedFrom.sender.status)}
														text={
															message.forwardedFrom.sender.status === 'online'
																? 'В сети'
																: message.forwardedFrom.sender.status === 'away'
																	? 'Отошёл'
																	: 'Не в сети'
														}
														style={{ fontSize: 10 }}
													/>
												)}
											</div>
											{message.forwardedFrom.content && (
												<Text
													style={{
														fontSize: 13,
														color: 'var(--tg-text-secondary)',
														display: 'block',
													}}
												>
													{message.forwardedFrom.content}
												</Text>
											)}
										</div>
									)}
									{showSenderName && (
										<Text
											style={{
												display: 'block',
												fontSize: 13,
												fontWeight: 500,
												color: 'var(--tg-blue)',
												marginBottom: 4,
											}}
										>
											{message.sender.firstName} {message.sender.lastName}
										</Text>
									)}
									<div
										style={{
											fontSize: 15,
											color: 'var(--tg-text-primary)',
											lineHeight: 1.4,
											wordBreak: 'break-word',
										}}
									>
										<MessageText content={message.content || ''} />
									</div>
									<div
										style={{
											display: 'flex',
											justifyContent: 'flex-end',
											alignItems: 'center',
											gap: 4,
											marginTop: 4,
										}}
									>
										{isOwn && message.status && (
											<span style={{ display: 'flex', alignItems: 'center' }}>
												{getStatusIcon(message.status)}
											</span>
										)}
										<Text
											style={{
												fontSize: 11,
												color: 'var(--tg-text-secondary)',
											}}
										>
											{format(new Date(message.createdAt), 'HH:mm', { locale: ru })}
											{message.editedAt && (
												<span
													style={{
														fontSize: 11,
														color: 'var(--tg-text-secondary)',
														marginLeft: 4,
														fontStyle: 'italic',
													}}
												>
													(ред.)
												</span>
											)}
										</Text>
									</div>
								</div>
							</Dropdown>
						</div>
					</div>
				)
			})}
			<UserProfileModal
				user={selectedUser || null}
				visible={!!selectedUserId}
				onClose={() => setSelectedUserId(null)}
			/>
			<ForwardMessageModal
				visible={!!forwardMessage}
				onClose={() => {
					setForwardMessage(null)
				}}
				message={forwardMessage}
				onForward={handleForward}
				multipleCount={isSelectionMode && selectedMessages.size > 0 ? selectedMessages.size : undefined}
			/>
			<Modal
				title="Редактировать сообщение"
				open={!!editingMessage}
				onOk={() => {
					if (editingMessage && editContent.trim()) {
						updateMessage.mutate(
							{ id: editingMessage.id, data: { content: editContent.trim() } },
							{
								onSuccess: () => {
									setEditingMessage(null)
									setEditContent('')
								},
							}
						)
					}
				}}
				onCancel={() => {
					setEditingMessage(null)
					setEditContent('')
				}}
				confirmLoading={updateMessage.isPending}
				okText="Сохранить"
				cancelText="Отмена"
			>
				<Input.TextArea
					value={editContent}
					onChange={(e) => setEditContent(e.target.value)}
					placeholder="Введите текст сообщения..."
					autoSize={{ minRows: 3, maxRows: 6 }}
					onPressEnter={(e) => {
						if (e.ctrlKey || e.metaKey) {
							// Ctrl+Enter или Cmd+Enter для отправки
							if (editingMessage && editContent.trim()) {
								updateMessage.mutate(
									{ id: editingMessage.id, data: { content: editContent.trim() } },
									{
										onSuccess: () => {
											setEditingMessage(null)
											setEditContent('')
										},
									}
								)
							}
						}
					}}
					style={{
						background: 'var(--tg-bg)',
						borderColor: 'var(--tg-border)',
						color: 'var(--tg-text-primary)',
					}}
					styles={{
						textarea: {
							background: 'var(--tg-bg)',
							color: 'var(--tg-text-primary)',
						},
					}}
				/>
			</Modal>
		</div>
	)
}
