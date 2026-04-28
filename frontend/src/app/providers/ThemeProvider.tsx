import { createContext, useContext, ReactNode, useState, useEffect, useMemo } from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeContextType {
	mode: ThemeMode
	setMode: (mode: ThemeMode) => void
	isDark: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
	const context = useContext(ThemeContext)
	if (!context) {
		throw new Error('useTheme must be used within ThemeProvider')
	}
	return context
}

interface ThemeProviderProps {
	children: ReactNode
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
	const [mode, setModeState] = useState<ThemeMode>(() => {
		const saved = localStorage.getItem('theme')
		return (saved as ThemeMode) || 'system'
	})

	const [systemDark, setSystemDark] = useState(() => {
		return window.matchMedia('(prefers-color-scheme: dark)').matches
	})

	useEffect(() => {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
		const handleChange = (e: MediaQueryListEvent) => {
			setSystemDark(e.matches)
		}

		mediaQuery.addEventListener('change', handleChange)
		return () => mediaQuery.removeEventListener('change', handleChange)
	}, [])

	const isDark = useMemo(() => {
		if (mode === 'system') {
			return systemDark
		}
		return mode === 'dark'
	}, [mode, systemDark])

	useEffect(() => {
		const root = document.documentElement
		if (isDark) {
			root.classList.add('dark-theme')
			root.classList.remove('light-theme')
		} else {
			root.classList.add('light-theme')
			root.classList.remove('dark-theme')
		}
	}, [isDark])

	const setMode = (newMode: ThemeMode) => {
		setModeState(newMode)
		localStorage.setItem('theme', newMode)
	}

	const value = useMemo(
		() => ({
			mode,
			setMode,
			isDark,
		}),
		[mode, isDark]
	)

	return (
		<ThemeContext.Provider value={value}>
			{children}
		</ThemeContext.Provider>
	)
}
