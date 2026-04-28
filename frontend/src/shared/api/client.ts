import axios from 'axios'
import { CONFIG } from '../config'
import { message } from 'antd'

export const http = axios.create({
	baseURL: CONFIG.API_URL,
	headers: {
		'Content-Type': 'application/json',
	},
})

// Добавляем токен к каждому запросу
http.interceptors.request.use((config) => {
	const token = localStorage.getItem('accessToken')
	if (token) {
		config.headers.Authorization = `Bearer ${token}`
	}
	return config
})

// Обрабатываем ошибки
http.interceptors.response.use(
	(response) => response,
	async (error) => {
		// Не делаем редирект на /login при ошибке авторизации (это обрабатывается в компонентах)
		// Редирект только если токен невалидный на защищенных страницах
		if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login') && !error.config?.url?.includes('/auth/register')) {
			const currentPath = window.location.pathname
			if (currentPath !== '/login' && currentPath !== '/register') {
				localStorage.removeItem('accessToken')
				localStorage.removeItem('refreshToken')
				window.location.href = '/login'
			}
		}
		// Сообщения об ошибках показываются в компонентах
		return Promise.reject(error)
	}
)