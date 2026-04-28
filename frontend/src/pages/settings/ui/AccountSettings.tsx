import { useEffect } from 'react'
import { Card, Typography, Form, Input, Button, Space, Divider } from 'antd'
import { useProfile } from '@/entities/user/api/useProfile'
import { useUpdateProfile } from '@/entities/user/api/useUpdateProfile'
import { useLogout } from '@/features/auth'
import { LogoutOutlined } from '@ant-design/icons'

const { Title } = Typography

export const AccountSettings = () => {
	const { data: user, isLoading } = useProfile()
	const updateProfile = useUpdateProfile()
	const logout = useLogout()
	const [form] = Form.useForm()

	useEffect(() => {
		if (user) {
			form.setFieldsValue({
				firstName: user.firstName,
				lastName: user.lastName,
				bio: user.bio || '',
				position: user.position || '',
				department: user.department || '',
				currentProject: user.currentProject || '',
			})
		}
	}, [user, form])

	const handleSubmit = (values: {
		firstName: string
		lastName: string
		bio?: string
		position?: string
		department?: string
		currentProject?: string
	}) => {
		updateProfile.mutate(values)
	}

	return (
		<div style={{ maxWidth: 700 }}>
			<Title level={2} style={{ marginBottom: 24, fontSize: 24, fontWeight: 600 }}>
				Аккаунт
			</Title>
			<Card
				loading={isLoading}
				style={{
					boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
					borderRadius: 12,
					border: '1px solid var(--tg-border)',
					background: 'var(--tg-bg)',
				}}
			>
				<Form
					form={form}
					initialValues={{
						firstName: user?.firstName,
						lastName: user?.lastName,
						bio: user?.bio,
						position: user?.position,
						department: user?.department,
						currentProject: user?.currentProject,
					}}
					onFinish={handleSubmit}
					layout="vertical"
					disabled={isLoading}
				>
					<Space direction="vertical" style={{ width: '100%' }} size="large">
						<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
							<Form.Item
								name="firstName"
								label={<span style={{ fontWeight: 500, fontSize: 15, color: 'var(--tg-text-primary)' }}>Имя</span>}
								rules={[{ required: true, message: 'Введите имя' }]}
								style={{ marginBottom: 0 }}
							>
								<Input 
									size="large" 
									placeholder="Имя" 
									style={{ 
										borderRadius: 8,
										background: 'var(--tg-bg)',
										borderColor: 'var(--tg-border)',
										color: 'var(--tg-text-primary)',
									}} 
								/>
							</Form.Item>
							<Form.Item
								name="lastName"
								label={<span style={{ fontWeight: 500, fontSize: 15, color: 'var(--tg-text-primary)' }}>Фамилия</span>}
								rules={[{ required: true, message: 'Введите фамилию' }]}
								style={{ marginBottom: 0 }}
							>
								<Input 
									size="large" 
									placeholder="Фамилия" 
									style={{ 
										borderRadius: 8,
										background: 'var(--tg-bg)',
										borderColor: 'var(--tg-border)',
										color: 'var(--tg-text-primary)',
									}} 
								/>
							</Form.Item>
						</div>
						<Form.Item
							name="position"
							label={<span style={{ fontWeight: 500, fontSize: 15, color: 'var(--tg-text-primary)' }}>Должность</span>}
						>
							<Input
								size="large"
								placeholder="Например: Руководитель отдела, Менеджер проекта"
								style={{ 
									borderRadius: 8,
									background: 'var(--tg-bg)',
									borderColor: 'var(--tg-border)',
									color: 'var(--tg-text-primary)',
								}}
							/>
						</Form.Item>
						<Form.Item
							name="department"
							label={<span style={{ fontWeight: 500, fontSize: 15, color: 'var(--tg-text-primary)' }}>Структурное подразделение</span>}
						>
							<Input
								size="large"
								placeholder="Например: Отдел разработки, Бухгалтерия"
								style={{ 
									borderRadius: 8,
									background: 'var(--tg-bg)',
									borderColor: 'var(--tg-border)',
									color: 'var(--tg-text-primary)',
								}}
							/>
						</Form.Item>
						<Form.Item
							name="currentProject"
							label={<span style={{ fontWeight: 500, fontSize: 15, color: 'var(--tg-text-primary)' }}>Текущий проект</span>}
						>
							<Input
								size="large"
								placeholder="Название текущего проекта"
								style={{ 
									borderRadius: 8,
									background: 'var(--tg-bg)',
									borderColor: 'var(--tg-border)',
									color: 'var(--tg-text-primary)',
								}}
							/>
						</Form.Item>
						<Form.Item
							name="bio"
							label={
								<span style={{ fontWeight: 500, fontSize: 15, color: 'var(--tg-text-primary)' }}>
									О себе
								</span>
							}
						>
							<Input.TextArea
								rows={5}
								placeholder="Расскажите о себе, своих интересах, опыте работы..."
								style={{ 
									borderRadius: 8,
									background: 'var(--tg-bg)',
									borderColor: 'var(--tg-border)',
									color: 'var(--tg-text-primary)',
									resize: 'none',
								}}
								showCount
								maxLength={500}
								styles={{
									textarea: {
										background: 'var(--tg-bg)',
										color: 'var(--tg-text-primary)',
									},
								}}
							/>
						</Form.Item>
						<Form.Item style={{ marginBottom: 0 }}>
							<Button
								type="primary"
								htmlType="submit"
								loading={updateProfile.isPending}
								size="large"
								style={{
									background: '#3390ec',
									borderColor: '#3390ec',
									height: 44,
									fontSize: 15,
									fontWeight: 500,
									borderRadius: 8,
									boxShadow: 'none',
								}}
							>
								Сохранить изменения
							</Button>
						</Form.Item>
					</Space>
				</Form>
			</Card>
			<Card
				style={{
					marginTop: 24,
					boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
					borderRadius: 12,
					border: '1px solid var(--tg-border)',
					background: 'var(--tg-bg)',
				}}
			>
				<Divider style={{ margin: '0 0 16px 0' }} />
				<Button
					type="primary"
					danger
					icon={<LogoutOutlined />}
					onClick={logout}
					size="large"
					block
					style={{
						height: 44,
						fontSize: 15,
						fontWeight: 500,
						borderRadius: 8,
					}}
				>
					Выйти из аккаунта
				</Button>
			</Card>
		</div>
	)
}

