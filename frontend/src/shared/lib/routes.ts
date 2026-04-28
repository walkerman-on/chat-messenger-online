export const ROUTES = {
	login: '/login',
	register: '/register',
	chats: '/chats',
	chat: (id: string) => `/chats/${id}`,
	friends: '/friends',
	tasks: '/tasks',
	settings: '/settings',
} as const
