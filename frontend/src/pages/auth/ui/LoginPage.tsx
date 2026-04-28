import { useState } from 'react'
import { Form, Input, Button, Card, Typography, Alert } from 'antd'
import { useLogin } from '@/features/auth'
import { ROUTES } from '@/shared/lib'
import { Link } from 'react-router'

const { Title } = Typography

export const LoginPage = () => {
	const login = useLogin()
	const [form] = Form.useForm()
	const [needs2FA, setNeeds2FA] = useState(false)

	const onFinish = (values: { email: string; password: string; twoFactorCode?: string }) => {
		login.mutate(values, {
			onError: (error: any) => {
				// Если требуется 2FA код
				if (error?.response?.data?.message?.includes('2FA code is required')) {
					setNeeds2FA(true)
				}
			},
			onSuccess: () => {
				setNeeds2FA(false)
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
					Вход
				</Title>
				<Form form={form} onFinish={onFinish} layout="vertical">
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
					{needs2FA && (
						<>
							<Alert
								message="Требуется код двухфакторной аутентификации"
								description="Введите 6-значный код из приложения Яндекс.Ключ"
								type="info"
								showIcon
								style={{ marginBottom: 16 }}
							/>
							<Form.Item
								name="twoFactorCode"
								label={<span style={{ fontWeight: 500, color: 'var(--tg-text-primary)' }}>Код из Яндекс.Ключ</span>}
								rules={[
									{ required: true, message: 'Введите код' },
									{ len: 6, message: 'Код должен содержать 6 цифр' },
								]}
							>
								<Input
									size="large"
									style={{ 
										borderRadius: 8,
										background: 'var(--tg-bg)',
										borderColor: 'var(--tg-border)',
										color: 'var(--tg-text-primary)',
									}}
									placeholder="000000"
									maxLength={6}
									onChange={(e) => {
										// Разрешаем только цифры
										const value = e.target.value.replace(/\D/g, '')
										form.setFieldValue('twoFactorCode', value)
									}}
								/>
							</Form.Item>
						</>
					)}
					<Form.Item style={{ marginTop: 24 }}>
						<Button
							type="primary"
							htmlType="submit"
							block
							loading={login.isPending}
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
							Войти
						</Button>
					</Form.Item>
					<div style={{ textAlign: 'center', marginTop: 16 }}>
						<Link
							to={ROUTES.register}
							style={{ color: 'var(--tg-blue)', textDecoration: 'none' }}
						>
							Нет аккаунта? Зарегистрироваться
						</Link>
					</div>
				</Form>
			</Card>
		</div>
	)
}
