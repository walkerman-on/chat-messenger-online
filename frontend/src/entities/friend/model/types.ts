import { User } from '@/entities/user'

export type FriendRequestStatus = 'pending' | 'accepted' | 'rejected'

export interface FriendRequest {
	id: string
	sender: User
	receiver: User
	status: FriendRequestStatus
	createdAt: string
	updatedAt: string
}
