/**
 * Возвращает цвет статуса для Badge компонента
 */
export const getStatusColor = (status?: 'online' | 'offline' | 'away'): 'success' | 'default' | 'warning' => {
	switch (status) {
		case 'online':
			return 'success'
		case 'away':
			return 'warning'
		default:
			return 'default'
	}
}

