import { useState } from 'react'
import { Layout, Menu, Typography } from 'antd'
import {
	BgColorsOutlined,
	SafetyOutlined,
	LockOutlined,
	UserOutlined,
} from '@ant-design/icons'
import { AppearanceSettings } from './AppearanceSettings'
import { PrivacySettings } from './PrivacySettings'
import { SecuritySettings } from './SecuritySettings'
import { AccountSettings } from './AccountSettings'
import { BottomNavigationMenu } from '@/shared/ui'

const { Sider, Content } = Layout
const { Title } = Typography

type SettingsMenuKey = 'account' | 'appearance' | 'privacy' | 'security'

const menuItems = [
	{
		key: 'account',
		icon: <UserOutlined />,
		label: 'Аккаунт',
	},
	{
		key: 'appearance',
		icon: <BgColorsOutlined />,
		label: 'Внешний вид',
	},
	{
		key: 'privacy',
		icon: <LockOutlined />,
		label: 'Приватность',
	},
	{
		key: 'security',
		icon: <SafetyOutlined />,
		label: 'Безопасность',
	},
]

export const SettingsPage = () => {
	const [selectedKey, setSelectedKey] = useState<SettingsMenuKey>('account')

	const renderContent = () => {
		switch (selectedKey) {
			case 'account':
				return <AccountSettings />
			case 'appearance':
				return <AppearanceSettings />
			case 'privacy':
				return <PrivacySettings />
			case 'security':
				return <SecuritySettings />
			default:
				return <AccountSettings />
		}
	}

	return (
		<div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--tg-bg-secondary)' }}>
			<Layout style={{ flex: 1, background: 'transparent', minHeight: 0 }}>
				<Sider
					width={360}
					breakpoint="lg"
					collapsedWidth={0}
					style={{
						background: 'var(--tg-bg)',
						borderRight: '1px solid var(--tg-border)',
						overflow: 'hidden',
						height: '100%',
						display: 'flex',
						flexDirection: 'column',
					}}
					className="settings-sider"
				>
					<div style={{ padding: '24px 20px', borderBottom: '1px solid var(--tg-border)', flexShrink: 0 }}>
						<Title level={3} style={{ margin: 0, fontSize: 22, fontWeight: 600, color: 'var(--tg-text-primary)' }}>
							Настройки
						</Title>
					</div>
					<div style={{ flex: 1, overflow: 'auto', minHeight: 0, paddingBottom: 60 }}>
					<Menu
						mode="inline"
						selectedKeys={[selectedKey]}
						items={menuItems}
						onClick={({ key }) => setSelectedKey(key as SettingsMenuKey)}
						style={{
							background: 'transparent',
							border: 'none',
							fontSize: 15,
							padding: '8px',
							marginTop: '8px',
						}}
						className="settings-menu"
					/>
					</div>
				</Sider>
				<Content
					style={{
						flex: 1,
						overflow: 'auto',
						padding: '32px 40px',
						background: 'var(--tg-bg-secondary)',
						minHeight: 0,
					}}
					className="settings-content"
				>
					{renderContent()}
				</Content>
			</Layout>
			<BottomNavigationMenu />
			<style>{`
				.settings-menu .ant-menu-item {
					margin: 4px 0;
					border-radius: 8px;
					height: 44px;
					line-height: 44px;
					padding-left: 16px !important;
					margin-bottom: 4px;
					transition: all 0.2s ease;
				}
				.settings-menu .ant-menu-item:hover {
					background-color: var(--tg-hover) !important;
				}
				.settings-menu .ant-menu-item-selected {
					background-color: var(--tg-blue) !important;
					color: white !important;
				}
				.settings-menu .ant-menu-item-selected .anticon {
					color: white !important;
				}
				.settings-menu .ant-menu-item:not(.ant-menu-item-selected) .anticon {
					color: var(--tg-text-secondary);
				}
				.settings-menu .ant-menu-item:not(.ant-menu-item-selected):hover .anticon {
					color: var(--tg-text-primary);
				}
				
				@media (max-width: 992px) {
					.settings-content {
						padding: 24px 20px !important;
					}
				}
			`}</style>
		</div>
	)
}
