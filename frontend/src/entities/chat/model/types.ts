import { User } from '@/entities/user'

export type ChatType = 'private' | 'group'

export type SecurityLevel = 'none' | 'commercial' | 'state'

export interface Chat {
	id: string
	name: string
	type: ChatType
	avatar?: string
	securityLevel?: SecurityLevel
	createdBy: User
	members: User[]
	createdAt: string
	updatedAt: string
}
