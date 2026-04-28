import { Modal, Form, Input, Select, DatePicker } from 'antd'
import { useFriends } from '@/features/friends'
import { User } from '@/entities/user'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'

const { TextArea } = Input

interface CreateTaskModalProps {
	open: boolean
	onCancel: () => void
	onOk: (values: {
		title: string
		description?: string
		assigneeIds: string[]
		dueDate?: string
	}) => void
	loading?: boolean
}

export const CreateTaskModal = ({ open, onCancel, onOk, loading }: CreateTaskModalProps) => {
	const [form] = Form.useForm()
	const { data: friends } = useFriends()

	const handleOk = () => {
		form.validateFields().then((values) => {
			onOk({
				title: values.title,
				description: values.description,
				assigneeIds: values.assigneeIds || [],
				dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : undefined,
			})
			form.resetFields()
		})
	}

	const handleCancel = () => {
		form.resetFields()
		onCancel()
	}

	const friendOptions = friends?.map((friend: User) => ({
		label: `${friend.firstName} ${friend.lastName}`,
		value: friend.id,
	})) || []

	return (
		<Modal
			title="Создать задачу"
			open={open}
			onOk={handleOk}
			onCancel={handleCancel}
			confirmLoading={loading}
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
	)
}

