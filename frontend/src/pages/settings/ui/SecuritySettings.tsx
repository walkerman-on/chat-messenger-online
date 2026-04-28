import { useState } from 'react'
import { Card, Typography, Space, Button, Modal, Form, Input, Image, Spin, Alert } from 'antd'
import { useTwoFactorStatus, useGenerateSecret, useEnable2FA, useDisable2FA } from '@/features/two-factor'

const { Title, Text } = Typography

export const SecuritySettings = () => {
	const { data: twoFactorStatus, isLoading: isLoading2FA } = useTwoFactorStatus()
	const generateSecret = useGenerateSecret()
	const enable2FA = useEnable2FA()
	const disable2FA = useDisable2FA()
	
	const [qrModalVisible, setQrModalVisible] = useState(false)
	const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
	const [verificationCode, setVerificationCode] = useState('')
	const [enableForm] = Form.useForm()

	const handleGenerateSecret = async () => {
		try {
			const response = await generateSecret.mutateAsync()
			setQrCodeUrl(response.data.qrCodeUrl)
			setQrModalVisible(true)
		} catch (error) {
			console.error('Error generating secret:', error)
		}
	}

	const handleEnable2FA = async () => {
		if (!verificationCode || verificationCode.length !== 6) {
			return
		}
		try {
			await enable2FA.mutateAsync(verificationCode)
			setQrModalVisible(false)
			setVerificationCode('')
			setQrCodeUrl(null)
			enableForm.resetFields()
		} catch (error) {
			console.error('Error enabling 2FA:', error)
		}
	}

	const handleDisable2FA = () => {
		Modal.confirm({
			title: 'Отключить двухфакторную аутентификацию?',
			content: 'После отключения ваш аккаунт будет менее защищен. Вы уверены?',
			okText: 'Отключить',
			cancelText: 'Отмена',
			okButtonProps: { danger: true },
			onOk: () => {
				disable2FA.mutate()
			},
		})
	}

	return (
		<div style={{ maxWidth: 700 }}>
			<Title level={2} style={{ marginBottom: 24, fontSize: 24, fontWeight: 600 }}>
				Безопасность
			</Title>
			<Card
				style={{
					boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
					borderRadius: 12,
					border: '1px solid var(--tg-border)',
					background: 'var(--tg-bg)',
				}}
			>
				<Space direction="vertical" style={{ width: '100%' }} size="large">
					<div>
						<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
							<div style={{ flex: 1 }}>
								<div style={{ fontWeight: 500, marginBottom: 6, fontSize: 15 }}>
									Двухфакторная аутентификация
								</div>
								<Text type="secondary" style={{ fontSize: 13, lineHeight: 1.5, display: 'block' }}>
									{isLoading2FA ? (
										<Spin size="small" />
									) : twoFactorStatus?.enabled ? (
										'Включена. Дополнительная защита вашего аккаунта активна.'
									) : (
										'Добавьте дополнительный уровень защиты для входа в аккаунт. Рекомендуется использовать приложение Яндекс.Ключ или Google Authenticator.'
									)}
								</Text>
								{twoFactorStatus?.enabled && (
									<Alert
										message="2FA активна"
										description="При каждом входе вам потребуется код из приложения-аутентификатора"
										type="success"
										showIcon
										style={{ marginTop: 12 }}
									/>
								)}
							</div>
						</div>
						{!isLoading2FA && (
							<div style={{ marginTop: 16 }}>
								{twoFactorStatus?.enabled ? (
									<Button
										danger
										onClick={handleDisable2FA}
										loading={disable2FA.isPending}
										size="large"
										style={{
											height: 44,
											fontSize: 15,
											fontWeight: 500,
											borderRadius: 8,
										}}
									>
										Отключить 2FA
									</Button>
								) : (
									<Button
										type="primary"
										onClick={handleGenerateSecret}
										loading={generateSecret.isPending}
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
										Включить двухфакторную аутентификацию
									</Button>
								)}
							</div>
						)}
					</div>
				</Space>
			</Card>
			<Modal
				title={
					<Title level={4} style={{ margin: 0 }}>
						Настройка двухфакторной аутентификации
					</Title>
				}
				open={qrModalVisible}
				onCancel={() => {
					setQrModalVisible(false)
					setVerificationCode('')
					setQrCodeUrl(null)
					enableForm.resetFields()
				}}
				footer={null}
				width={440}
				styles={{
					content: {
						borderRadius: 12,
					},
				}}
			>
				<Space direction="vertical" style={{ width: '100%' }} size="large">
					<div>
						<Text strong style={{ fontSize: 14, display: 'block', marginBottom: 12 }}>
							Шаг 1: Отсканируйте QR-код
						</Text>
						<div
							style={{
								marginTop: 8,
								textAlign: 'center',
								padding: '16px',
								background: '#f5f5f5',
								borderRadius: 8,
							}}
						>
							{qrCodeUrl ? (
								<Image src={qrCodeUrl} alt="QR Code" style={{ maxWidth: '100%' }} />
							) : (
								<Spin size="large" />
							)}
						</div>
						<Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 12 }}>
							Используйте приложение Яндекс.Ключ или Google Authenticator для сканирования QR-кода
						</Text>
					</div>
					<div>
						<Text strong style={{ fontSize: 14, display: 'block', marginBottom: 12 }}>
							Шаг 2: Введите код подтверждения
						</Text>
						<Form form={enableForm} onFinish={handleEnable2FA}>
							<Form.Item
								name="code"
								rules={[
									{ required: true, message: 'Введите код' },
									{ len: 6, message: 'Код должен содержать 6 цифр' },
								]}
								style={{ marginBottom: 16 }}
							>
								<Input
									size="large"
									placeholder="000000"
									maxLength={6}
									value={verificationCode}
									onChange={(e) => {
										const value = e.target.value.replace(/\D/g, '')
										setVerificationCode(value)
										enableForm.setFieldValue('code', value)
									}}
									style={{ borderRadius: 8 }}
								/>
							</Form.Item>
							<Form.Item style={{ marginBottom: 0 }}>
								<Button
									type="primary"
									htmlType="submit"
									block
									loading={enable2FA.isPending}
									disabled={verificationCode.length !== 6}
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
									Подтвердить и включить
								</Button>
							</Form.Item>
						</Form>
					</div>
				</Space>
			</Modal>
		</div>
	)
}

