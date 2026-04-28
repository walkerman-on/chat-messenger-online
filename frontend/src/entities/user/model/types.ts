export interface User {
	id: string
	email: string
	username: string
	firstName: string
	lastName: string
	avatar?: string
	status?: 'online' | 'offline' | 'away'
	lastSeen?: string
	bio?: string
	position?: string
	department?: string
	currentProject?: string
	isActive: boolean
	createdAt: string
	updatedAt: string
}
