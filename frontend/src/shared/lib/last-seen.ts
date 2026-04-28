/**
 * Форматирует время последнего посещения в читаемый формат
 * @param lastSeen - строка с датой последнего посещения (ISO format)
 * @returns строка типа "был(а) в сети 5 минут назад" или "был(а) в сети вчера в 15:30"
 */
export const formatLastSeen = (lastSeen?: string): string => {
	if (!lastSeen) return ''

	const now = new Date()
	const seen = new Date(lastSeen)
	const diffMs = now.getTime() - seen.getTime()
	const diffMins = Math.floor(diffMs / 60000)
	const diffHours = Math.floor(diffMs / 3600000)
	const diffDays = Math.floor(diffMs / 86400000)

	// Меньше минуты
	if (diffMins < 1) {
		return 'только что'
	}

	// Меньше часа
	if (diffMins < 60) {
		const mins = diffMins
		if (mins === 1) return 'минуту назад'
		if (mins < 5) return `${mins} минуты назад`
		if (mins < 21) return `${mins} минут назад`
		// Для 21, 22, 23, 24 минуты
		if (mins % 10 === 1 && mins !== 11) return `${mins} минуту назад`
		if (mins % 10 >= 2 && mins % 10 <= 4 && (mins < 10 || mins > 20)) return `${mins} минуты назад`
		return `${mins} минут назад`
	}

	// Меньше суток
	if (diffHours < 24) {
		const hours = diffHours
		if (hours === 1) return 'час назад'
		if (hours < 5) return `${hours} часа назад`
		if (hours < 21) return `${hours} часов назад`
		// Для 21, 22, 23 часа
		if (hours % 10 === 1 && hours !== 11) return `${hours} час назад`
		if (hours % 10 >= 2 && hours % 10 <= 4 && (hours < 10 || hours > 20)) return `${hours} часа назад`
		return `${hours} часов назад`
	}

	// Вчера
	if (diffDays === 1) {
		const hours = seen.getHours()
		const mins = seen.getMinutes()
		return `вчера в ${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
	}

	// Несколько дней назад (до недели)
	if (diffDays < 7) {
		const days = diffDays
		if (days === 1) return 'вчера'
		if (days < 5) return `${days} дня назад`
		return `${days} дней назад`
	}

	// Больше недели - показываем дату
	const day = seen.getDate()
	const month = seen.getMonth() + 1
	const year = seen.getFullYear()
	const hours = seen.getHours()
	const mins = seen.getMinutes()

	// Если в этом году, показываем без года
	if (year === now.getFullYear()) {
		return `${day}.${String(month).padStart(2, '0')} в ${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
	}

	// Иначе с годом
	return `${day}.${String(month).padStart(2, '0')}.${year} в ${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

