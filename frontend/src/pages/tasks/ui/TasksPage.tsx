import { useState } from 'react'
import { Layout, Button, Tabs, Modal, Form, Input, Select, DatePicker, Empty } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useCreateTask } from '@/features/tasks'
import { useSearchParams } from 'react-router'
import { TaskList } from '@/widgets/task-list'
import { TaskView } from './TaskView'
import { useFriends } from '@/features/friends'
import { User } from '@/entities/user'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import { BottomNavigationMenu } from '@/shared/ui'

const { Content, Sider } = Layout
const { TextArea } = Input

export const TasksPage = () => {
	const [searchParams, setSearchParams] = useSearchParams()
	const selectedTaskId = searchParams.get('task')
	const [activeTab, setActiveTab] = useState<'assigned' | 'delegated'>('assigned')
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [form] = Form.useForm()
	const createTask = useCreateTask()
	const { data: friends } = useFriends()

	const handleTaskSelect = (taskId: string) => {
		setSearchParams({ task: taskId })
	}

	const handleCreateTask = (values: {
		title: string
		description?: string
		assigneeIds: string[]
		dueDate?: string
	}) => {
		createTask.mutate(values, {
			onSuccess: () => {
				setIsModalOpen(false)
				form.resetFields()
			},
		})
	}

	const handleOk = () => {
		form.validateFields().then((values) => {
			handleCreateTask({
				title: values.title,
				description: values.description,
				assigneeIds: values.assigneeIds || [],
				dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : undefined,
			})
		})
	}

	const friendOptions = friends?.map((friend: User) => ({
		label: `${friend.firstName} ${friend.lastName}`,
		value: friend.id,
	})) || []

	return (
		<div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--tg-bg-secondary)' }}>
			<Layout style={{ flex: 1, overflow: 'hidden', background: 'var(--tg-bg-secondary)', minHeight: 0 }}>
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
							padding: '20px 16px',
							borderBottom: '1px solid var(--tg-border)',
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							flexShrink: 0,
							background: 'var(--tg-bg)',
						}}
					>
						<h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: 'var(--tg-text-primary)' }}>
							Задачи
						</h2>
						<Button
							type="primary"
							icon={<PlusOutlined />}
							onClick={() => setIsModalOpen(true)}
							size="small"
							style={{
								background: '#3390ec',
								borderColor: '#3390ec',
								height: 32,
								fontSize: 14,
								fontWeight: 500,
								borderRadius: 6,
							}}
						>
							Создать
						</Button>
					</div>

					<div style={{ padding: '0 16px', borderBottom: '1px solid var(--tg-border)', background: 'var(--tg-bg)', flexShrink: 0 }}>
						<Tabs
							activeKey={activeTab}
							onChange={(key) => setActiveTab(key as 'assigned' | 'delegated')}
							style={{
								background: 'var(--tg-bg)',
							}}
							items={[
								{
									key: 'assigned',
									label: (
										<span style={{ fontSize: 15, fontWeight: 500 }}>
											На мне
										</span>
									),
								},
								{
									key: 'delegated',
									label: (
										<span style={{ fontSize: 15, fontWeight: 500 }}>
											Делегированные
										</span>
									),
								},
							]}
							className="tasks-tabs"
						/>
						<style>{`
							.tasks-tabs .ant-tabs-tab {
								padding: 12px 16px !important;
								margin: 0 4px !important;
								font-size: 15px !important;
								border-radius: 8px 8px 0 0 !important;
								transition: all 0.2s ease !important;
							}
							.tasks-tabs .ant-tabs-tab:hover {
								background: var(--tg-hover) !important;
							}
							.tasks-tabs .ant-tabs-tab-active {
								background: rgba(51, 144, 236, 0.1) !important;
								color: #3390ec !important;
								font-weight: 600 !important;
							}
							.tasks-tabs .ant-tabs-ink-bar {
								background: #3390ec !important;
								height: 3px !important;
							}
							.tasks-tabs .ant-tabs-nav {
								margin: 0 !important;
							}
						`}</style>
					</div>

					<div style={{ flex: 1, overflow: 'auto', minHeight: 0, paddingBottom: 60 }}>
						<TaskList
							activeTab={activeTab}
							selectedTaskId={selectedTaskId || undefined}
							onTaskSelect={handleTaskSelect}
						/>
					</div>
				</Sider>
				<Content style={{ background: 'var(--tg-bg-secondary)', overflow: 'hidden' }}>
					{selectedTaskId ? (
						<TaskView taskId={selectedTaskId} />
					) : (
						<div
							style={{
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
								height: '100%',
								background: 'var(--tg-bg-secondary)',
							}}
						>
							<Empty description="Выберите задачу для просмотра" />
						</div>
					)}
				</Content>
			</Layout>
			<BottomNavigationMenu />

			<Modal
				title="Создать задачу"
				open={isModalOpen}
				onOk={handleOk}
				onCancel={() => {
					setIsModalOpen(false)
					form.resetFields()
				}}
				confirmLoading={createTask.isPending}
				okText="Создать"
				cancelText="Отмена"
				width={500}
			>
				<Form
					form={form}
					layout="vertical"
					initialValues={{
						assigneeIds: [],
					}}
				>
					<Form.Item
						name="title"
						label="Название задачи"
						rules={[{ required: true, message: 'Введите название задачи' }]}
					>
						<Input placeholder="Введите название задачи" />
					</Form.Item>

					<Form.Item
						name="description"
						label="Описание"
					>
						<TextArea
							rows={4}
							placeholder="Введите описание задачи (необязательно)"
						/>
					</Form.Item>

					<Form.Item
						name="assigneeIds"
						label="Исполнитель"
						rules={[{ required: true, message: 'Выберите исполнителя' }]}
					>
						<Select
							mode="multiple"
							placeholder="Выберите исполнителя"
							options={friendOptions}
							showSearch
							filterOption={(input, option) =>
								(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
							}
						/>
					</Form.Item>

					<Form.Item
						name="dueDate"
						label="Срок выполнения"
					>
						<DatePicker
							style={{ width: '100%' }}
							placeholder="Выберите дату (необязательно)"
							format="DD.MM.YYYY"
							disabledDate={(current) => current && current < dayjs().startOf('day')}
						/>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	)
}

