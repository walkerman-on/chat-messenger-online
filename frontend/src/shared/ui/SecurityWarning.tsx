import { Modal } from 'antd'
import { ExclamationCircleOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons'
import { SecurityLevel } from '@/entities/chat'

interface SecurityWarningProps {
	securityLevel: SecurityLevel | undefined
	visible: boolean
	onConfirm: () => void
	onCancel: () => void
}

export const SecurityWarning = ({ securityLevel, visible, onConfirm, onCancel }: SecurityWarningProps) => {
	if (!securityLevel || securityLevel === 'none') return null

	const config = {
		state: {
			title: 'Доступ к чату с грифом "Государственная тайна"',
			icon: <SafetyOutlined style={{ color: '#ff4d4f', fontSize: 48 }} />,
			content: (
				<div>
					<p style={{ marginBottom: 16, fontWeight: 500 }}>
						Вы собираетесь открыть чат с грифом секретности <strong>"Государственная тайна"</strong>.
					</p>
					<div style={{ background: '#fff2f0', padding: 12, borderRadius: 6, marginBottom: 16 }}>
						<p style={{ margin: 0, fontSize: 13, color: '#cf1322' }}>
							<strong>Внимание!</strong> При работе с данным чатом действуют следующие ограничения:
						</p>
						<ul style={{ margin: '8px 0 0 0', paddingLeft: 20, fontSize: 13, color: '#cf1322' }}>
							<li>Запрещено копирование текста</li>
							<li>Запрещено выделение текста</li>
							<li>Запрещено использование контекстного меню</li>
							<li>Запрещено создание скриншотов</li>
							<li>Запрещено использование инструментов разработчика</li>
							<li>Все действия логируются</li>
						</ul>
					</div>
					<p style={{ margin: 0, fontSize: 13, color: '#8c8c8c' }}>
						Продолжая, вы подтверждаете, что понимаете и согласны с данными ограничениями.
					</p>
				</div>
			),
			okText: 'Понял, продолжить',
			okButtonProps: { danger: true },
		},
		commercial: {
			title: 'Доступ к чату с грифом "Коммерческая тайна"',
			icon: <LockOutlined style={{ color: '#fa8c16', fontSize: 48 }} />,
			content: (
				<div>
					<p style={{ marginBottom: 16, fontWeight: 500 }}>
						Вы собираетесь открыть чат с грифом секретности <strong>"Коммерческая тайна"</strong>.
					</p>
					<div style={{ background: '#fff7e6', padding: 12, borderRadius: 6, marginBottom: 16 }}>
						<p style={{ margin: 0, fontSize: 13, color: '#d46b08' }}>
							<strong>Внимание!</strong> При работе с данным чатом действуют следующие ограничения:
						</p>
						<ul style={{ margin: '8px 0 0 0', paddingLeft: 20, fontSize: 13, color: '#d46b08' }}>
							<li>Запрещено копирование текста</li>
							<li>Запрещено использование контекстного меню</li>
							<li>Запрещено создание скриншотов</li>
							<li>Все действия логируются</li>
						</ul>
					</div>
					<p style={{ margin: 0, fontSize: 13, color: '#8c8c8c' }}>
						Продолжая, вы подтверждаете, что понимаете и согласны с данными ограничениями.
					</p>
				</div>
			),
			okText: 'Понял, продолжить',
			okButtonProps: { type: 'primary' },
		},
	}

	const { title, icon, content, okText, okButtonProps } = config[securityLevel]

	return (
		<Modal
			title={
				<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
					{icon}
					<span>{title}</span>
				</div>
			}
			open={visible}
			onOk={onConfirm}
			onCancel={onCancel}
			okText={okText}
			cancelText="Отмена"
			width={520}
			okButtonProps={okButtonProps}
			cancelButtonProps={{ type: 'default' }}
		>
			{content}
		</Modal>
	)
}

