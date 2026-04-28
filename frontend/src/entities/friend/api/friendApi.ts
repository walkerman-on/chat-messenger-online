import { http } from '@/shared/api'
import { FriendRequest } from '../model/types'
import { User } from '@/entities/user'

export interface CreateFriendRequestDto {
	receiverId: string
}

export const friendApi = {
	getFriends: () => http.get<User[]>('/friends'),
	searchUsers: (query: string) => http.get<User[]>(`/friends/search?q=${query}`),
	sendFriendRequest: (data: CreateFriendRequestDto) =>
		http.post<FriendRequest>('/friends/requests', data),
	getFriendRequests: () => http.get<FriendRequest[]>('/friends/requests'),
	acceptFriendRequest: (id: string) => http.patch<FriendRequest>(`/friends/requests/${id}/accept`),
	rejectFriendRequest: (id: string) => http.patch<FriendRequest>(`/friends/requests/${id}/reject`),
	removeFriend: (id: string) => http.delete(`/friends/${id}`),
}
