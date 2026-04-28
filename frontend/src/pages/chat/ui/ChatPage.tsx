import { Input, Button } from 'antd'
import { MessageList } from '@/widgets/message-list'
import { useChat } from '@/features/chats'
import { useSendMessage } from '@/features/messages'
import { useParams, useNavigate } from 'react-router'
import { ROUTES } from '@/shared/lib'
import { useState, useEffect, useRef } from 'react'
import { socketManager } from '@/shared/lib'
import { useQueryClient } from '@tanstack/react-query'
import { useProfile, User } from '@/entities/user'
import { ArrowLeftOutlined, SendOutlined } from '@ant-design/icons'
import { EmojiPickerButton } from '@/shared/ui'

const { TextArea } = Input

export const ChatPage = () => {
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()
	const { data: chat } = useChat(id)
	const { data: currentUser } = useProfile()
	const sendMessage = useSendMessage()
	const queryClient = useQueryClient()
	const [message, setMessage] = useState('')
	const textAreaRef = useRef<any>(null)

	useEffect(() => {
		if (!currentUser?.id || !id) return

		const socket = socketManager.connect(currentUser.id)
		if (!socket) return

		socket.emit('join-chat', { chatId: id })

		const handleNewMessage = () => {
			queryClient.invalidateQueries({ queryKey: ['messages', id] })
			queryClient.invalidateQueries({ queryKey: ['chats'] })
		}

		socket.on('new-message', handleNewMessage)

		return () => {
			socket.off('new-message', handleNewMessage)
		}
	}, [currentUser?.id, id, queryClient])

	const handleSend = () => {
		if (!message.trim() || !id) return

		sendMessage.mutate(
			{
				type: 'text',
				content: message,
				chatId: id,
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

	return (
		<div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)', background: '#f0f2f5' }}>
			<div
				style={{
					background: '#ffffff',
					display: 'flex',
					alignItems: 'center',
					gap: 12,
					padding: '0 16px',
					borderBottom: '1px solid var(--tg-border)',
					minHeight: 56,
					boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
				}}
			>
				<Button
					icon={<ArrowLeftOutlined />}
					onClick={() => navigate(ROUTES.chats)}
					type="text"
					style={{ color: '#3390ec' }}
				/>
				<h3 style={{ margin: 0, fontSize: 16, fontWeight: 500, color: '#000' }}>{getChatName()}</h3>
			</div>
			<div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', background: '#f0f2f5' }}>
				<div style={{ flex: 1, overflow: 'auto', background: '#f0f2f5' }}>
					{id && <MessageList chatId={id} />}
				</div>
				<div
					style={{
						padding: '12px 16px',
						background: '#ffffff',
						borderTop: '1px solid var(--tg-border)',
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
								borderRadius: 20,
								padding: '8px 16px',
								fontSize: 15,
							}}
						/>
						<Button
							type="primary"
							icon={<SendOutlined />}
							onClick={handleSend}
							loading={sendMessage.isPending}
							disabled={!message.trim()}
							style={{
								background: '#3390ec',
								borderColor: '#3390ec',
								borderRadius: '50%',
								width: 40,
								height: 40,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								flexShrink: 0,
							}}
						/>
					</div>
				</div>
			</div>
		</div>
	)
}