import { io, Socket } from 'socket.io-client'
import { CONFIG } from '../config'

class SocketManager {
	private socket: Socket | null = null
	private userId: string | null = null

	connect(userId: string) {
		if (this.socket?.connected && this.userId === userId) {
			return this.socket
		}

		if (this.socket && this.userId !== userId) {
			this.socket.disconnect()
			this.socket = null
		}

		this.userId = userId

		this.socket = io(`${CONFIG.WS_URL}/chat`, {
			auth: { userId },
			reconnection: true,
			reconnectionDelay: 1000,
			reconnectionAttempts: 5,
		})

		this.socket.on('connect', () => {
			console.log('Socket connected for user:', userId)
		})

		this.socket.on('disconnect', () => {
			console.log('Socket disconnected')
		})

		this.socket.on('connect_error', (error) => {
			console.error('Socket connection error:', error)
		})

		return this.socket
	}

	disconnect() {
		if (this.socket) {
			this.socket.disconnect()
			this.socket = null
		}
	}

	getSocket() {
		return this.socket
	}
}

export const socketManager = new SocketManager()