import { Empty, Spin, List } from 'antd'
import { useMyTasks, useDelegatedTasks } from '@/features/tasks'
import { Task } from '@/entities/task'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'

interface TaskListProps {
	activeTab: 'assigned' | 'delegated'
	selectedTaskId?: string
	onTaskSelect: (taskId: string) => void
}

export const TaskList = ({ activeTab, selectedTaskId, onTaskSelect }: TaskListProps) => {
	const { data: myTasks, isLoading: isLoadingMyTasks } = useMyTasks()
	const { data: delegatedTasks, isLoading: isLoadingDelegatedTasks } = useDelegatedTasks()

	const tasks = activeTab === 'assigned' ? myTasks : delegatedTasks
	const isLoading = activeTab === 'assigned' ? isLoadingMyTasks : isLoadingDelegatedTasks

	if (isLoading) {
		return (
			<div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
				<Spin />
			</div>
		)
	}

	if (!tasks || tasks.length === 0) {
		return (
			<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
				<Empty description={activeTab === 'assigned' ? 'Нет назначенных задач' : 'Нет делегированных задач'} />
			</div>
		)
	}

	const getStatusColor = (status: Task['status']) => {
		switch (status) {
			case 'completed':
				return '#52c41a'
			case 'in_progress':
				return '#1890ff'
			case 'cancelled':
				return '#8c8c8c'
			default:
				return '#faad14'
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
		<List
			dataSource={tasks}
			style={{ background: 'var(--tg-bg)' }}
			renderItem={(task: Task) => {
				const isActive = selectedTaskId === task.id
				return (
					<List.Item
						onClick={() => onTaskSelect(task.id)}
						style={{
							cursor: 'pointer',
							background: isActive ? 'rgba(51, 144, 236, 0.08)' : 'var(--tg-bg)',
							padding: '14px 16px',
							borderLeft: isActive ? '3px solid #3390ec' : '3px solid transparent',
							borderBottom: '1px solid var(--tg-border)',
							transition: 'all 0.2s ease',
						}}
						onMouseEnter={(e) => {
							if (!isActive) {
								e.currentTarget.style.background = 'var(--tg-hover)'
							}
						}}
						onMouseLeave={(e) => {
							if (!isActive) {
								e.currentTarget.style.background = 'var(--tg-bg)'
							}
						}}
					>
					<div style={{ width: '100%' }}>
						<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
							<div style={{ flex: 1, minWidth: 0 }}>
								<div
									style={{
										fontSize: 16,
										fontWeight: isActive ? 600 : 500,
										color: isActive ? '#3390ec' : 'var(--tg-text-primary)',
										marginBottom: 4,
										overflow: 'hidden',
										textOverflow: 'ellipsis',
										whiteSpace: 'nowrap',
									}}
								>
									{task.title}
								</div>
								{task.description && (
									<div
										style={{
											fontSize: 13,
											color: isActive ? 'var(--tg-text-primary)' : 'var(--tg-text-secondary)',
											marginBottom: 4,
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											whiteSpace: 'nowrap',
											lineHeight: 1.4,
										}}
									>
										{task.description}
									</div>
								)}
							</div>
							<div
								style={{
									padding: '4px 10px',
									borderRadius: 6,
									background: getStatusColor(task.status),
									color: '#fff',
									fontSize: 11,
									fontWeight: 600,
									marginLeft: 8,
									flexShrink: 0,
									boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
								}}
							>
								{getStatusText(task.status)}
							</div>
						</div>
						<div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: isActive ? 'var(--tg-text-primary)' : 'var(--tg-text-secondary)', flexWrap: 'wrap' }}>
							{task.assignees && task.assignees.length > 0 && (
								<span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
									{activeTab === 'assigned' ? 'От' : 'Для'}: 
									<span style={{ fontWeight: 500 }}>
										{task.assignees.map(u => `${u.firstName} ${u.lastName}`).join(', ')}
									</span>
								</span>
							)}
							{task.dueDate && (
								<span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
									<ClockCircleOutlined />
									{format(new Date(task.dueDate), 'dd.MM.yyyy', { locale: ru })}
								</span>
							)}
							<span style={{ opacity: 0.7 }}>
								{format(new Date(task.createdAt), 'dd.MM.yyyy', { locale: ru })}
							</span>
						</div>
					</div>
				</List.Item>
				)
			}}
		/>
	)
}
