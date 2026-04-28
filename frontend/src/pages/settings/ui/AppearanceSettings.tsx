import { Card, Typography, Switch, Space, Divider } from 'antd'
import { useTheme } from '@/app/providers/ThemeProvider'

const { Title, Text } = Typography

export const AppearanceSettings = () => {
	const { mode, setMode, isDark } = useTheme()

	return (
		<div style={{ maxWidth: 700 }}>
			<Title level={2} style={{ marginBottom: 24, fontSize: 24, fontWeight: 600 }}>
				Внешний вид
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
					<div
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'flex-start',
							padding: '8px 0',
						}}
					>
						<div style={{ flex: 1 }}>
							<div style={{ fontWeight: 500, marginBottom: 6, fontSize: 15 }}>
								Темная тема
							</div>
							<Text type="secondary" style={{ fontSize: 13, lineHeight: 1.5 }}>
								{mode === 'system'
									? 'Следует системным настройкам устройства'
									: mode === 'dark'
										? 'Всегда включена'
										: 'Всегда выключена'}
							</Text>
						</div>
						<Switch
							checked={isDark}
							onChange={(checked) => setMode(checked ? 'dark' : 'light')}
							style={{ marginLeft: 16 }}
						/>
					</div>
					<Divider style={{ margin: '16px 0' }} />
					<div
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'flex-start',
							padding: '8px 0',
						}}
					>
						<div style={{ flex: 1 }}>
							<div style={{ fontWeight: 500, marginBottom: 6, fontSize: 15 }}>
								Следовать системной теме
							</div>
							<Text type="secondary" style={{ fontSize: 13, lineHeight: 1.5 }}>
								Автоматически переключать тему в зависимости от настроек операционной системы
							</Text>
						</div>
						<Switch
							checked={mode === 'system'}
							onChange={(checked) => setMode(checked ? 'system' : (isDark ? 'dark' : 'light'))}
							style={{ marginLeft: 16 }}
						/>
					</div>
				</Space>
			</Card>
		</div>
	)
}

