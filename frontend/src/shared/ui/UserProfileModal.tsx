import { Modal, Avatar, Typography, Space, Divider, Badge } from 'antd'
import { User } from '@/entities/user'
import { getAvatarColor, getStatusColor, formatLastSeen } from '@/shared/lib'
import { UserOutlined } from '@ant-design/icons'

const { Text, Title } = Typography

interface UserProfileModalProps {
	user: User | null
	visible: boolean
	onClose: () => void
}

export const UserProfileModal = ({ user, visible, onClose }: UserProfileModalProps) => {
	if (!user) return null

	return (
		<Modal
			title={null}
			open={visible}
			onCancel={onClose}
			footer={null}
			width={400}
			styles={{
				content: {
					padding: 0,
				},
			}}
		>
			<div style={{ padding: 24 }}>
				<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
					<Badge status={getStatusColor(user.status)} offset={[-2, 2]}>
						<Avatar
							size={80}
							src={user.avatar}
							style={{
								backgroundColor: user.avatar ? undefined : getAvatarColor(user.id),
								fontSize: 32,
							}}
						>
							{user.firstName?.[0] || user.username?.[0] || <UserOutlined />}
						</Avatar>
					</Badge>
					<Title
						level={3}
						style={{
							margin: '16px 0 4px 0',
							fontSize: 20,
							fontWeight: 600,
							textAlign: 'center',
						}}
					>
						{user.firstName} {user.lastName}
					</Title>
					<Text type="secondary" style={{ fontSize: 14 }}>
						@{user.username}
					</Text>
					{user.status && (
						<div style={{ marginTop: 8 }}>
							<Badge status={getStatusColor(user.status)} text={
								user.status === 'online'
									? 'В сети'
									: user.status === 'away'
										? 'Отошёл'
										: user.lastSeen
											? formatLastSeen(user.lastSeen)
											: 'Не в сети'
							} />
						</div>
					)}
				</div>

				<Divider style={{ margin: '16px 0' }} />
				<Space direction="vertical" style={{ width: '100%' }} size="middle">
					{user.bio ? (
						<div>
							<Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
								О себе
							</Text>
							<Text style={{ fontSize: 14 }}>{user.bio}</Text>
						</div>
					) : null}

					<div>
						<Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 2 }}>
							Должность
						</Text>
						<Text style={{ fontSize: 14 }}>{user.position || 'Не указана'}</Text>
					</div>

					<div>
						<Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 2 }}>
							Подразделение
						</Text>
						<Text style={{ fontSize: 14 }}>{user.department || 'Не указано'}</Text>
					</div>

					<div>
						<Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 2 }}>
							Текущий проект
						</Text>
						<Text style={{ fontSize: 14 }}>{user.currentProject || 'Не указан'}</Text>
					</div>
				</Space>
			</div>
		</Modal>
	)
}

