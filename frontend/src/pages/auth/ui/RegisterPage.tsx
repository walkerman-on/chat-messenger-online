import { useRegister } from '@/features/auth'
import { ROUTES } from '@/shared/lib'
import { Button, Card, Form, Input, Typography } from 'antd'
import { Link } from 'react-router'

const { Title } = Typography

export const RegisterPage = () => {
	const register = useRegister()
	const [form] = Form.useForm()
	const onFinish = (values: {
		email: string
		password: string
		username: string
		firstName: string
		lastName: string
	}) => {
		register.mutate(values, {
			onError: () => {
				// Форма не сбрасывается при ошибке
			},
		})
	}

	return (
		<div
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				minHeight: '100vh',
				background: 'var(--tg-bg-secondary)',
			}}
		>
			<Card
				style={{
					width: 400,
					borderRadius: 12,
					boxShadow: 'var(--tg-shadow)',
					background: 'var(--tg-bg)',
					border: '1px solid var(--tg-border)',
				}}
				styles={{
					body: {
						padding: 32,
					},
				}}
			>
				<Title level={2} style={{ textAlign: 'center', color: 'var(--tg-text-primary)', marginBottom: 24 }}>
					Регистрация
				</Title>
				<Form form={form} onFinish={onFinish} layout="vertical">
					<Form.Item
						name="firstName"
						label={<span style={{ fontWeight: 500, color: 'var(--tg-text-primary)' }}>Имя</span>}
						rules={[{ required: true, message: 'Введите имя' }]}
					>
						<Input 
							size="large" 
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
						label={<span style={{ fontWeight: 500, color: 'var(--tg-text-primary)' }}>Фамилия</span>}
						rules={[{ required: true, message: 'Введите фамилию' }]}
					>
						<Input 
							size="large" 
							style={{ 
								borderRadius: 8,
								background: 'var(--tg-bg)',
								borderColor: 'var(--tg-border)',
								color: 'var(--tg-text-primary)',
							}} 
						/>
					</Form.Item>
					<Form.Item
						name="username"
						label={<span style={{ fontWeight: 500, color: 'var(--tg-text-primary)' }}>Username</span>}
						rules={[{ required: true, message: 'Введите username' }]}
					>
						<Input 
							size="large" 
							style={{ 
								borderRadius: 8,
								background: 'var(--tg-bg)',
								borderColor: 'var(--tg-border)',
								color: 'var(--tg-text-primary)',
							}} 
						/>
					</Form.Item>
					<Form.Item
						name="email"
						label={<span style={{ fontWeight: 500, color: 'var(--tg-text-primary)' }}>Email</span>}
						rules={[{ required: true, message: 'Введите email' }]}
					>
						<Input 
							type="email" 
							size="large" 
							style={{ 
								borderRadius: 8,
								background: 'var(--tg-bg)',
								borderColor: 'var(--tg-border)',
								color: 'var(--tg-text-primary)',
							}} 
						/>
					</Form.Item>
					<Form.Item
						name="password"
						label={<span style={{ fontWeight: 500, color: 'var(--tg-text-primary)' }}>Пароль</span>}
						rules={[{ required: true, message: 'Введите пароль' }]}
					>
						<Input.Password 
							size="large" 
							style={{ 
								borderRadius: 8,
								background: 'var(--tg-bg)',
								borderColor: 'var(--tg-border)',
								color: 'var(--tg-text-primary)',
							}} 
						/>
					</Form.Item>
					<Form.Item style={{ marginTop: 24 }}>
						<Button
							type="primary"
							htmlType="submit"
							block
							loading={register.isPending}
							size="large"
							style={{
								background: '#3390ec',
								borderColor: '#3390ec',
								height: 44,
								fontSize: 16,
								fontWeight: 500,
								borderRadius: 8,
							}}
						>
							Зарегистрироваться
						</Button>
					</Form.Item>
					<div style={{ textAlign: 'center', marginTop: 16 }}>
						<Link
							to={ROUTES.login}
							style={{ color: 'var(--tg-blue)', textDecoration: 'none' }}
						>
							Уже есть аккаунт? Войти
						</Link>
					</div>
				</Form>
			</Card>
		</div>
	)
}
