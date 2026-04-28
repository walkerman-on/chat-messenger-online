import { Button } from 'antd'
import { MessageOutlined, UserOutlined, SettingOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router'
import { ROUTES } from '@/shared/lib'

export const BottomNavigationMenu = () => {
	const navigate = useNavigate()
	const location = useLocation()

	const menuItems = [
		{
			key: ROUTES.chats,
			icon: <MessageOutlined />,
			label: 'Чаты',
			isActive: location.pathname === ROUTES.chats,
		},
		{
			key: ROUTES.friends,
			icon: <UserOutlined />,
			label: 'Друзья',
			isActive: location.pathname === ROUTES.friends,
		},
		{
			key: ROUTES.tasks,
			icon: <CheckCircleOutlined />,
			label: 'Задачи',
			isActive: location.pathname === ROUTES.tasks,
		},
		{
			key: ROUTES.settings,
			icon: <SettingOutlined />,
			label: 'Настройки',
			isActive: location.pathname === ROUTES.settings,
		},
	]

	return (
		<div
			style={{
				position: 'fixed',
				bottom: 0,
				left: 0,
				width: 360,
				borderTop: '1px solid var(--tg-border)',
				padding: '8px 4px',
				background: 'var(--tg-bg)',
				zIndex: 100,
				display: 'flex',
				gap: 4,
			}}
		>
			{menuItems.map((item) => (
				<Button
					key={item.key}
					type="text"
					icon={item.icon}
					onClick={() => navigate(item.key)}
					title={item.label}
					style={{
						color: item.isActive ? '#3390ec' : 'var(--tg-text-secondary)',
						fontWeight: item.isActive ? 500 : 400,
						height: 44,
						flex: 1,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						padding: 0,
						borderRadius: 8,
					}}
				/>
			))}
		</div>
	)
}

