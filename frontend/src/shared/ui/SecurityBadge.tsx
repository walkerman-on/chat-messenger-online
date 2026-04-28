import { Tag } from 'antd'
import { SecurityLevel } from '@/entities/chat'
import { LockOutlined, SafetyOutlined } from '@ant-design/icons'

interface SecurityBadgeProps {
	securityLevel: SecurityLevel | undefined
}

export const SecurityBadge = ({ securityLevel }: SecurityBadgeProps) => {
	if (!securityLevel || securityLevel === 'none') return null

	const config = {
		state: {
			color: 'red',
			text: 'Гос. тайна',
			icon: <SafetyOutlined />,
		},
		commercial: {
			color: 'orange',
			text: 'Коммерческая тайна',
			icon: <LockOutlined />,
		},
	}

	const { color, text, icon } = config[securityLevel]

	return (
		<Tag
			color={color}
			icon={icon}
			style={{
				fontSize: 10,
				fontWeight: 600,
				padding: '1px 6px',
				borderRadius: 3,
				lineHeight: '16px',
				height: '18px',
				flexShrink: 0,
				margin: 0,
			}}
		>
			{securityLevel === 'state' ? 'Гос.' : 'Ком.'}
		</Tag>
	)
}

