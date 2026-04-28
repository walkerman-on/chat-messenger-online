import { createContext, useContext, ReactNode, useMemo } from 'react'
import { useProfile, User } from '@/entities/user'
import { useLogout } from '@/features/auth'

interface AuthContextType {
	user: User | undefined
	isLoading: boolean
	isAuthenticated: boolean
	logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
	const context = useContext(AuthContext)
	if (!context) {
		throw new Error('useAuth must be used within AuthProvider')
	}
	return context
}

interface AuthProviderProps {
	children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
	const accessToken = localStorage.getItem('accessToken')
	const hasToken = !!accessToken
	const { data: user, isLoading } = useProfile(hasToken)
	const logoutFn = useLogout()

	const logout = useMemo(() => logoutFn, [logoutFn])

	const isAuthenticated = hasToken && !!user && !isLoading

	const value = useMemo(
		() => ({
			user,
			isLoading,
			isAuthenticated,
			logout,
		}),
		[user, isLoading, isAuthenticated, logout]
	)

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}