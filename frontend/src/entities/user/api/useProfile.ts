import { useQuery } from '@tanstack/react-query'
import { userApi } from './userApi'

export const useProfile = (enabled: boolean = true) => {
	return useQuery({
		queryKey: ['user', 'profile'],
		queryFn: async () => {
			const response = await userApi.getProfile()
			return response.data
		},
		enabled,
		retry: false,
	})
}
