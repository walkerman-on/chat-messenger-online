import { Card, Tag, Avatar, Typography, Button, Space } from 'antd'
import { Task } from '@/entities/task'
import { CheckOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

const { Text, Paragraph } = Typography

interface TaskCardProps {
	task: Task
	onComplete?: (task: Task) => void
	showCompleteButton?: boolean
}

export const TaskCard = ({ task, onComplete, showCompleteButton = true }: TaskCardProps) => {
	const getStatusColor = (status: Task['status']) => {
		switch (status) {
			case 'completed':
				return 'success'
			case 'in_progress':
				return 'processing'
			case 'cancelled':
				return 'default'
			default:
				return 'warning'
		}
	}

	const getStatusText = (status: Task['status']) => {
		switch (status) {
			case 'completed':
				return 'Выполнена'
			case 'in_progress':
				return 'В работе'
			case 'cancelled':
				return 'Отменена'
			default:
				return 'Открыта'
		}
	}

	return (
		<Card
			size="small"
			style={{
				marginBottom: 8,
				borderLeft: `3px solid ${
					task.status === 'completed' ? '#52c41a' : task.status === 'in_progress' ? '#1890ff' : '#faad14'
				}`,
			}}
		>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
				<div style={{ flex: 1 }}>
					<div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
						<Tag color={getStatusColor(task.status)}>{getStatusText(task.status)}</Tag>
						<Tag color="blue">{task.hashtag}</Tag>
					</div>
					<Text strong style={{ fontSize: 15, display: 'block', marginBottom: 4 }}>
						{task.title}
					</Text>
					{task.description && (
						<Paragraph
							ellipsis={{ rows: 2, expandable: false }}
							style={{ margin: 0, fontSize: 13, color: 'var(--tg-text-secondary)' }}
						>
							{task.description}
						</Paragraph>
					)}
				</div>
				{task.status !== 'completed' && onComplete && showCompleteButton && (
					<Button
						type="primary"
						icon={<CheckOutlined />}
						size="small"
						onClick={() => onComplete(task)}
						style={{ flexShrink: 0 }}
					>
						Выполнить
					</Button>
				)}
			</div>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
				<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
					{task.assignees && task.assignees.length > 0 && (
						<Space size={4}>
							<UserOutlined style={{ fontSize: 12, color: 'var(--tg-text-secondary)' }} />
							<Text style={{ fontSize: 12, color: 'var(--tg-text-secondary)' }}>
								{task.assignees.map(u => `${u.firstName} ${u.lastName}`).join(', ')}
							</Text>
						</Space>
					)}
				</div>
				<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
					{task.dueDate && (
						<Space size={4}>
							<ClockCircleOutlined style={{ fontSize: 12, color: 'var(--tg-text-secondary)' }} />
							<Text style={{ fontSize: 12, color: 'var(--tg-text-secondary)' }}>
								{format(new Date(task.dueDate), 'dd.MM.yyyy', { locale: ru })}
							</Text>
						</Space>
					)}
					<Text style={{ fontSize: 11, color: 'var(--tg-text-secondary)' }}>
						{format(new Date(task.createdAt), 'dd.MM.yyyy HH:mm', { locale: ru })}
					</Text>
				</div>
			</div>
		</Card>
	)
}

