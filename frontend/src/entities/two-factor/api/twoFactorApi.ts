import { http } from '@/shared/api'

export interface TwoFactorStatus {
	enabled: boolean
	hasSecret: boolean
}

export interface GenerateSecretResponse {
	secret: string
	qrCodeUrl: string
}

export const twoFactorApi = {
	getStatus: () => http.get<TwoFactorStatus>('/two-factor/status'),
	generateSecret: () => http.post<GenerateSecretResponse>('/two-factor/generate-secret'),
	enable: (code: string) => http.post('/two-factor/enable', { code }),
	disable: () => http.delete('/two-factor/disable'),
}


