import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useAuth } from './AuthProvider'
import { ROUTES } from '@/shared/lib'
import { Spin } from 'antd'

interface ProtectedRouteProps {
	children: ReactNode
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
	const { isAuthenticated, isLoading } = useAuth()
	const location = useLocation()

	if (isLoading) {
		return (
			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					height: '100vh',
				}}
			>
				<Spin size="large" />
			</div>
		)
	}

	if (!isAuthenticated) {
		return <Navigate to={ROUTES.login} state={{ from: location }} replace />
	}

	return <>{children}</>
}
