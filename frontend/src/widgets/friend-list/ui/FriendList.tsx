import { List, Avatar, Button, Empty, Space, Badge } from 'antd'
import { useFriends } from '@/features/friends'
import { User } from '@/entities/user'
import { Typography } from 'antd'
import { getAvatarColor, getStatusColor } from '@/shared/lib'

const { Text } = Typography

export const FriendList = () => {
	const { data: friends, isLoading } = useFriends()

	if (isLoading) {
		return <div>Загрузка...</div>
	}

	if (!friends || friends.length === 0) {
		return <Empty description="Нет друзей" />
	}

	return (
		<List
			dataSource={friends}
			renderItem={(friend: User) => (
				<List.Item>
					<List.Item.Meta
						avatar={
							<Badge status={getStatusColor(friend.status)} offset={[-2, 2]}>
								<Avatar style={{ backgroundColor: getAvatarColor(friend.id) }}>
								{friend.firstName[0]}
							</Avatar>
							</Badge>
						}
						title={
							<Text strong>
								{friend.firstName} {friend.lastName}
							</Text>
						}
						description={`@${friend.username}`}
					/>
				</List.Item>
			)}
		/>
	)
}
