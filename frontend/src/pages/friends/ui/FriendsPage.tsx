import { Input, Button, List, Avatar, Space, Typography, Empty, Badge } from 'antd'
import { Layout } from 'antd'
import { FriendList } from '@/widgets/friend-list'
import { getAvatarColor, getStatusColor } from '@/shared/lib'
import {
	useSearchUsers,
	useSendFriendRequest,
	useFriendRequests,
	useAcceptFriendRequest,
	useRejectFriendRequest,
} from '@/features/friends'
import { User } from '@/entities/user'
import { FriendRequest } from '@/entities/friend'
import { useState } from 'react'
import { SearchOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { BottomNavigationMenu } from '@/shared/ui'

const { Content, Sider } = Layout
const { Title } = Typography

export const FriendsPage = () => {
	const [searchQuery, setSearchQuery] = useState('')
	const { data: searchResults } = useSearchUsers(searchQuery)
	const sendRequest = useSendFriendRequest()
	const { data: requests } = useFriendRequests()
	const acceptRequest = useAcceptFriendRequest()
	const rejectRequest = useRejectFriendRequest()

	const handleSendRequest = (userId: string) => {
		sendRequest.mutate({ receiverId: userId })
	}

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
					<div style={{ padding: 16, borderBottom: '1px solid var(--tg-border)', flexShrink: 0 }}>
						<Title level={4} style={{ margin: 0, color: 'var(--tg-text-primary)' }}>
						Друзья
					</Title>
					</div>
					<div style={{ flex: 1, overflow: 'auto', minHeight: 0, paddingLeft: 16, paddingRight: 16, paddingBottom: 60 }}>
					<FriendList />
					</div>
				</Sider>
				<Content style={{ padding: 24, background: 'var(--tg-bg-secondary)', overflow: 'auto', flex: 1 }}>
					<Space direction="vertical" style={{ width: '100%' }} size="large">
						<div>
							<Title level={4}>Поиск пользователей</Title>
							<Input
								prefix={<SearchOutlined />}
								placeholder="Введите username"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								style={{ marginBottom: 16 }}
							/>
							{searchResults && searchResults.length > 0 && (
								<List
									dataSource={searchResults}
									renderItem={(user: User) => (
										<List.Item
											actions={[
												<Button
													key="add"
													type="primary"
													onClick={() => handleSendRequest(user.id)}
												>
													Добавить
												</Button>,
											]}
										>
											<List.Item.Meta
												avatar={
													<Badge status={getStatusColor(user.status)} offset={[-2, 2]}>
														<Avatar style={{ backgroundColor: getAvatarColor(user.id) }}>
															{user.firstName[0]}
														</Avatar>
													</Badge>
												}
												title={`${user.firstName} ${user.lastName}`}
												description={`@${user.username}`}
											/>
										</List.Item>
									)}
								/>
							)}
						</div>
						<div>
							<Title level={4}>Запросы в друзья</Title>
							{requests && requests.length > 0 ? (
								<List
									dataSource={requests.filter((r) => r.status === 'pending')}
									renderItem={(request: FriendRequest) => (
										<List.Item
											actions={[
												<Button
													key="accept"
													type="primary"
													icon={<CheckOutlined />}
													onClick={() => acceptRequest.mutate(request.id)}
												>
													Принять
												</Button>,
												<Button
													key="reject"
													icon={<CloseOutlined />}
													onClick={() => rejectRequest.mutate(request.id)}
												>
													Отклонить
												</Button>,
											]}
										>
											<List.Item.Meta
												avatar={
													<Badge status={getStatusColor(request.sender.status)} offset={[-2, 2]}>
														<Avatar style={{ backgroundColor: getAvatarColor(request.sender.id) }}>
															{request.sender.firstName[0]}
														</Avatar>
													</Badge>
												}
												title={`${request.sender.firstName} ${request.sender.lastName}`}
												description={`@${request.sender.username}`}
											/>
										</List.Item>
									)}
								/>
							) : (
								<Empty description="Нет запросов" />
							)}
						</div>
					</Space>
				</Content>
			</div>
			<BottomNavigationMenu />
		</div>
	)
}
