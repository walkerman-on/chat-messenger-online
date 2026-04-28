/**
 * Утилиты для работы с браузерными уведомлениями
 */

export class NotificationService {
	private static permission: NotificationPermission = 'default'

	/**
	 * Запрашивает разрешение на показ уведомлений
	 */
	static async requestPermission(): Promise<NotificationPermission> {
		if (!('Notification' in window)) {
			console.warn('This browser does not support notifications')
			return 'denied'
		}

		if (Notification.permission === 'default') {
			this.permission = await Notification.requestPermission()
		} else {
			this.permission = Notification.permission
		}

		return this.permission
	}

	/**
	 * Проверяет, есть ли разрешение на показ уведомлений
	 */
	static hasPermission(): boolean {
		if (!('Notification' in window)) {
			return false
		}
		return Notification.permission === 'granted'
	}

	/**
	 * Показывает уведомление о новом сообщении
	 */
	static showMessageNotification(
		title: string,
		options: {
			body?: string
			icon?: string
			tag?: string
			data?: any
			showWhenActive?: boolean // Показывать даже когда вкладка активна
		} = {}
	): Notification | null {
		if (!this.hasPermission()) {
			console.log('[Notifications] No permission granted')
			return null
		}

		// Не показываем уведомление, если вкладка активна и не указано showWhenActive
		if (!options.showWhenActive && !document.hidden) {
			console.log('[Notifications] Tab is active, skipping notification')
			return null
		}

		const notification = new Notification(title, {
			body: options.body,
			icon: options.icon || '/favicon.ico',
			tag: options.tag,
			data: options.data,
			badge: '/favicon.ico',
			requireInteraction: false,
		})

		// Закрываем уведомление через 5 секунд
		setTimeout(() => {
			notification.close()
		}, 5000)

		// Обработчик клика на уведомление
		notification.onclick = () => {
			window.focus()
			notification.close()
			// Можно добавить навигацию к чату
			if (options.data?.chatId) {
				// Навигация будет обработана в компоненте
			}
		}

		return notification
	}

	/**
	 * Закрывает все уведомления с определенным тегом
	 */
	static closeNotificationsByTag(tag: string): void {
		// Браузер автоматически закрывает уведомления с одинаковым тегом
		// Но можно явно закрыть через API, если нужно
	}
}

