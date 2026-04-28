import ruRU from 'antd/locale/ru_RU'
import { QueryProvider } from './QueryProvider'
import { AuthProvider } from './AuthProvider'
import { ThemeProvider, useTheme } from './ThemeProvider'
import { ConfigProvider, theme as antdTheme } from 'antd'
import { ReactNode } from 'react'

const AppConfigProvider = ({ children }: { children: ReactNode }) => {
	const { isDark } = useTheme()
	
	return (
		<ConfigProvider
			locale={ruRU}
			theme={{
				algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
				token: {
					colorPrimary: '#3390ec',
				},
			}}
		>
			{children}
		</ConfigProvider>
	)
}

export const Providers = ({ children }: { children: ReactNode }) => {
	return (
		<ThemeProvider>
			<AppConfigProvider>
				<QueryProvider>
					<AuthProvider>{children}</AuthProvider>
				</QueryProvider>
			</AppConfigProvider>
		</ThemeProvider>
	)
}
