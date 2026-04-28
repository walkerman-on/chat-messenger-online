import { http } from '@/shared/api'
import { User } from '@/entities/user'

export interface LoginDto {
	email: string
	password: string
}

export interface RegisterDto {
	email: string
	password: string
	username: string
	firstName: string
	lastName: string
}

export interface AuthResponse {
	accessToken: string
	refreshToken: string
	user: User
}

export const authApi = {
	login: (data: LoginDto) => http.post<AuthResponse>('/auth/login', data),
	register: (data: RegisterDto) => http.post<AuthResponse>('/auth/register', data),
	refresh: () => http.post<AuthResponse>('/auth/refresh'),
}
