import { Menu } from 'antd'
import { MessageOutlined, UserOutlined, SettingOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router'
import { ROUTES } from '@/shared/lib'

export const SideNavigationMenu = () => {
	const navigate = useNavigate()
	const location = useLocation()

	const menuItems = [
		{
			key: ROUTES.chats,
			icon: <MessageOutlined />,
			label: 'Чаты',
		},
		{
			key: ROUTES.friends,
			icon: <UserOutlined />,
			label: 'Друзья',
		},
		{
			key: ROUTES.tasks,
			icon: <CheckCircleOutlined />,
			label: 'Задачи',
		},
		{
			key: ROUTES.settings,
			icon: <SettingOutlined />,
			label: 'Настройки',
		},
	]

	const selectedKey = menuItems.find((item) => location.pathname === item.key)?.key || ROUTES.chats

	return (
		<Menu
			mode="inline"
			selectedKeys={[selectedKey]}
			items={menuItems}
			onClick={({ key }) => navigate(key)}
			style={{
				background: 'var(--tg-bg)',
				border: 'none',
				fontSize: 15,
				height: '100%',
			}}
			className="side-navigation-menu"
		/>
	)
}


