import { Card, Typography, Form, Select, Button, Space } from 'antd'
import { usePrivacySettings, useUpdatePrivacySettings } from '@/features/settings'

const { Title } = Typography

export const PrivacySettings = () => {
	const { data: settings } = usePrivacySettings()
	const updateSettings = useUpdatePrivacySettings()
	const [form] = Form.useForm()

	const handleSubmit = (values: { whoCanMessageMe: string }) => {
		updateSettings.mutate({ whoCanMessageMe: values.whoCanMessageMe as 'everyone' | 'friends' })
	}

	return (
		<div style={{ maxWidth: 700 }}>
			<Title level={2} style={{ marginBottom: 24, fontSize: 24, fontWeight: 600 }}>
				Приватность
			</Title>
			<Card
				style={{
					boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
					borderRadius: 12,
					border: '1px solid var(--tg-border)',
					background: 'var(--tg-bg)',
				}}
			>
				<Form
					form={form}
					initialValues={settings}
					onFinish={handleSubmit}
					layout="vertical"
				>
					<Form.Item
						name="whoCanMessageMe"
						label={<span style={{ fontWeight: 500, fontSize: 15 }}>Кто может писать мне</span>}
						style={{ marginBottom: 24 }}
					>
						<Select size="large" style={{ borderRadius: 8 }}>
							<Select.Option value="everyone">Все пользователи</Select.Option>
							<Select.Option value="friends">Только друзья</Select.Option>
						</Select>
					</Form.Item>
					<Form.Item style={{ marginBottom: 0 }}>
						<Button
							type="primary"
							htmlType="submit"
							loading={updateSettings.isPending}
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
				</Form>
			</Card>
		</div>
	)
}

