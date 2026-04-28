import { Button, Tag, Typography, Empty } from 'antd'
import { CheckOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { useTask } from '@/features/tasks'
import { useUpdateTaskStatus } from '@/features/tasks'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

const { Text, Title, Paragraph } = Typography

interface TaskViewProps {
	taskId: string
}

export const TaskView = ({ taskId }: TaskViewProps) => {
	const { data: task, isLoading } = useTask(taskId)
	const updateTaskStatus = useUpdateTaskStatus()

	if (isLoading) {
		return (
			<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
				<Empty description="Загрузка задачи..." />
			</div>
		)
	}

	if (!task) {
		return (
			<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
				<Empty description="Задача не найдена" />
			</div>
		)
	}

	const getStatusColor = (status: string) => {
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

	const getStatusText = (status: string) => {
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

	const handleComplete = () => {
		updateTaskStatus.mutate({
			id: task.id,
			status: 'completed',
		})
	}

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				height: '100%',
				background: 'var(--tg-bg-secondary)',
			}}
		>
			<div
				style={{
					background: 'var(--tg-bg)',
					padding: '16px',
					borderBottom: '1px solid var(--tg-border)',
					boxShadow: 'var(--tg-shadow)',
				}}
			>
				<div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
					<Tag color={getStatusColor(task.status)}>{getStatusText(task.status)}</Tag>
					<Tag color="blue">{task.hashtag}</Tag>
				</div>
				<Title level={4} style={{ margin: 0, color: 'var(--tg-text-primary)' }}>
					{task.title}
				</Title>
			</div>

			<div style={{ flex: 1, overflow: 'auto', padding: '16px', background: 'var(--tg-bg-secondary)' }}>
				{task.description && (
					<div style={{ marginBottom: 24 }}>
						<Text strong style={{ display: 'block', marginBottom: 8, color: 'var(--tg-text-primary)' }}>
							Описание
						</Text>
						<Paragraph style={{ color: 'var(--tg-text-primary)', margin: 0 }}>
							{task.description}
						</Paragraph>
					</div>
				)}

				<div style={{ marginBottom: 24 }}>
					<Text strong style={{ display: 'block', marginBottom: 8, color: 'var(--tg-text-primary)' }}>
						Исполнители
					</Text>
					{task.assignees && task.assignees.length > 0 ? (
						<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
							{task.assignees.map((assignee) => (
								<div
									key={assignee.id}
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: 8,
										padding: '8px 12px',
										background: 'var(--tg-bg)',
										borderRadius: 8,
									}}
								>
									<UserOutlined style={{ fontSize: 16, color: 'var(--tg-text-secondary)' }} />
									<Text style={{ color: 'var(--tg-text-primary)' }}>
										{assignee.firstName} {assignee.lastName}
									</Text>
								</div>
							))}
						</div>
					) : (
						<Text style={{ color: 'var(--tg-text-secondary)' }}>Исполнители не назначены</Text>
					)}
				</div>

				<div style={{ marginBottom: 24 }}>
					<Text strong style={{ display: 'block', marginBottom: 8, color: 'var(--tg-text-primary)' }}>
						Информация
					</Text>
					<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
						<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
							<Text style={{ color: 'var(--tg-text-secondary)', minWidth: 120 }}>Создана:</Text>
							<Text style={{ color: 'var(--tg-text-primary)' }}>
								{format(new Date(task.createdAt), 'dd.MM.yyyy HH:mm', { locale: ru })}
							</Text>
						</div>
						{task.dueDate && (
							<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
								<ClockCircleOutlined style={{ color: 'var(--tg-text-secondary)', minWidth: 120 }} />
								<Text style={{ color: 'var(--tg-text-primary)' }}>
									Срок: {format(new Date(task.dueDate), 'dd.MM.yyyy', { locale: ru })}
								</Text>
							</div>
						)}
						<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
							<Text style={{ color: 'var(--tg-text-secondary)', minWidth: 120 }}>Создатель:</Text>
							<Text style={{ color: 'var(--tg-text-primary)' }}>
								{task.createdBy.firstName} {task.createdBy.lastName}
							</Text>
						</div>
					</div>
				</div>
			</div>

			{task.status !== 'completed' && (
				<div
					style={{
						padding: '16px',
						background: 'var(--tg-bg)',
						borderTop: '1px solid var(--tg-border)',
						flexShrink: 0,
					}}
				>
					<Button
						type="primary"
						icon={<CheckOutlined />}
						onClick={handleComplete}
						loading={updateTaskStatus.isPending}
						block
						style={{
							background: '#3390ec',
							borderColor: '#3390ec',
							height: 40,
						}}
					>
						Отметить как выполненную
					</Button>
				</div>
			)}
		</div>
	)
}

