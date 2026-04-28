import { Layout, Button, Modal, Form, Input, Select } from 'antd'
import { ChatList } from '@/widgets/chat-list'
import { useCreateChat, useChat } from '@/features/chats'
import { useSearchUsers } from '@/features/friends'
import { userApi, useProfile } from '@/entities/user'
import { useQuery } from '@tanstack/react-query'
import { PlusOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { User } from '@/entities/user'
import { ChatView } from './ChatView'
import { SecurityLevel } from '@/entities/chat'
import { BottomNavigationMenu } from '@/shared/ui'

const { Content, Sider } = Layout

export const ChatsPage = () => {
	const [searchParams, setSearchParams] = useSearchParams()
	const selectedChatId = searchParams.get('chat')
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [form] = Form.useForm()
	const [searchQuery, setSearchQuery] = useState('')
	const createChat = useCreateChat()
	const { data: searchResults } = useSearchUsers(searchQuery)
	const { data: allUsers } = useQuery({
		queryKey: ['users', 'all'],
		queryFn: async () => {
			const response = await userApi.getAllUsers()
			return response.data
		},
		enabled: !searchQuery || searchQuery.length === 0,
	})

	const handleCreateChat = (values: { name?: string; type: string; memberIds: string[]; securityLevel?: SecurityLevel }) => {
		let chatName = values.name

		// Для личных чатов генерируем имя на основе участников
		if (values.type === 'private' && !chatName && values.memberIds.length > 0) {
			const selectedUsers = availableUsers?.filter((user: User) =>
				values.memberIds.includes(user.id)
			)
			if (selectedUsers && selectedUsers.length > 0) {
				const user = selectedUsers[0]
				chatName = `${user.firstName} ${user.lastName}`.trim() || user.username
			} else {
				chatName = 'Личный чат'
			}
		}

		// Для групповых чатов название обязательно
		if (values.type === 'group' && !chatName) {
			chatName = 'Групповой чат'
		}

		// Добавляем текущего пользователя в список участников, если его там нет
		const allMemberIds = currentUser?.id
			? [...new Set([currentUser.id, ...values.memberIds])]
			: values.memberIds

		const chatData: { name: string; type: 'private' | 'group'; memberIds: string[]; securityLevel?: SecurityLevel } = {
			name: chatName || 'Чат',
			type: values.type as 'private' | 'group',
			memberIds: allMemberIds,
			securityLevel: values.securityLevel && values.securityLevel !== 'none' ? values.securityLevel : undefined,
		}

		createChat.mutate(chatData, {
			onSuccess: (chat) => {
				setIsModalOpen(false)
				form.resetFields()
				setSearchQuery('')
				setSearchParams({ chat: chat.id })
			},
		})
	}

	// Используем результаты поиска, если есть запрос, иначе все пользователи
	// Исключаем текущего пользователя из списка
	const { data: currentUser } = useProfile()
	const availableUsers = (searchQuery && searchQuery.length > 0 ? searchResults : allUsers)?.filter(
		(user: User) => user.id !== currentUser?.id
	)

	return (
		<div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
			<div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
				<Sider
					width={360}
					style={{
						background: 'var(--tg-bg)',
						borderRight: '1px solid var(--tg-border)',
						display: 'flex',
						flexDirection: 'column',
						overflow: 'hidden',
						height: '100%',
					}}
				>
					<div
						style={{
							padding: 16,
							borderBottom: '1px solid var(--tg-border)',
							background: 'var(--tg-bg)',
							flexShrink: 0,
						}}
					>
						<Button
							type="primary"
							icon={<PlusOutlined />}
							block
							onClick={() => setIsModalOpen(true)}
							style={{
								background: '#3390ec',
								borderColor: '#3390ec',
								height: 40,
								fontSize: 15,
								fontWeight: 500,
							}}
						>
							Создать чат
						</Button>
					</div>
					<div style={{ flex: 1, overflow: 'auto', minHeight: 0, paddingBottom: 60 }}>
						<ChatList />
					</div>
				</Sider>
				<Content style={{ padding: 0, background: 'var(--tg-bg-secondary)', overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
					{selectedChatId ? (
						<ChatView chatId={selectedChatId} />
					) : (
						<div
							style={{
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
								height: '100%',
								color: 'var(--tg-text-secondary)',
							}}
						>
							<div style={{ textAlign: 'center' }}>
								<h3 style={{ color: 'var(--tg-text-secondary)', fontWeight: 400 }}>Выберите чат или создайте новый</h3>
							</div>
						</div>
					)}
				</Content>
			</div>
			<BottomNavigationMenu />
			<Modal
				title={<span style={{ fontSize: 18, fontWeight: 500 }}>Создать чат</span>}
				open={isModalOpen}
				onCancel={() => {
					setIsModalOpen(false)
					setSearchQuery('')
					form.resetFields()
				}}
				footer={null}
				styles={{
					content: { padding: '24px' },
				}}
			>
				<Form form={form} onFinish={handleCreateChat} layout="vertical">
					<Form.Item name="type" label="Тип" initialValue="private">
						<Select
							onChange={() => {
								form.setFieldValue('name', undefined)
							}}
						>
							<Select.Option value="private">Личный</Select.Option>
							<Select.Option value="group">Группа</Select.Option>
						</Select>
					</Form.Item>
					<Form.Item
						noStyle
						shouldUpdate={(prevValues, currentValues) =>
							prevValues.type !== currentValues.type
						}
					>
						{({ getFieldValue }) =>
							getFieldValue('type') === 'group' ? (
								<Form.Item
									name="name"
									label="Название"
									rules={[{ required: true, message: 'Введите название для группового чата' }]}
								>
									<Input placeholder="Введите название чата" />
								</Form.Item>
							) : null
						}
					</Form.Item>
					<Form.Item
						name="memberIds"
						label="Участники"
						rules={[{ required: true, message: 'Выберите участников' }]}
					>
						<Select
							mode="multiple"
							placeholder="Начните вводить имя или username для поиска"
							showSearch
							filterOption={false}
							onSearch={setSearchQuery}
							loading={searchQuery ? (searchResults === undefined) : (allUsers === undefined)}
							notFoundContent={
								searchQuery
									? searchResults === undefined
										? 'Загрузка...'
										: 'Пользователи не найдены'
									: allUsers === undefined
										? 'Загрузка...'
										: availableUsers?.length === 0
											? 'Нет доступных пользователей'
											: 'Начните вводить для поиска'
							}
						>
							{availableUsers?.map((user: User) => (
								<Select.Option key={user.id} value={user.id}>
									{user.firstName} {user.lastName} (@{user.username})
								</Select.Option>
							))}
						</Select>
					</Form.Item>
					<Form.Item
						name="securityLevel"
						label="Гриф секретности"
						tooltip="Выберите уровень секретности для чата. Для чатов с грифом будут применены дополнительные меры безопасности."
						initialValue="none"
					>
						<Select>
							<Select.Option value="none">Без грифа</Select.Option>
							<Select.Option value="commercial">Коммерческая тайна</Select.Option>
							<Select.Option value="state">Гос. тайна</Select.Option>
						</Select>
					</Form.Item>
					<Form.Item style={{ marginBottom: 0, marginTop: 16 }}>
						<Button
							type="primary"
							htmlType="submit"
							block
							loading={createChat.isPending}
							style={{
								background: '#3390ec',
								borderColor: '#3390ec',
								height: 40,
								fontSize: 15,
								fontWeight: 500,
							}}
						>
							Создать
						</Button>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	)
}