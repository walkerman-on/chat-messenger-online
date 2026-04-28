import { Typography } from 'antd'
import { parseMessage } from '@/shared/lib'

const { Text } = Typography

interface MessageTextProps {
	content: string
}

export const MessageText = ({ content }: MessageTextProps) => {
	const parsed = parseMessage(content)
	
	// Разбиваем текст на части с учетом упоминаний и хештегов
	const parts: Array<{ text: string; type: 'text' | 'mention' | 'hashtag' }> = []
	let lastIndex = 0

	// Находим все упоминания и хештеги с их позициями
	const matches: Array<{ start: number; end: number; type: 'mention' | 'hashtag'; text: string }> = []

	// Упоминания (поддерживает кириллицу)
	const mentionRegex = /@([a-zA-Zа-яА-ЯёЁ0-9_]+)/g
	let match
	while ((match = mentionRegex.exec(content)) !== null) {
		matches.push({
			start: match.index,
			end: match.index + match[0].length,
			type: 'mention',
			text: match[0],
		})
	}

	// Хештеги (поддерживает кириллицу)
	const hashtagRegex = /#([a-zA-Zа-яА-ЯёЁ0-9]+)/g
	while ((match = hashtagRegex.exec(content)) !== null) {
		matches.push({
			start: match.index,
			end: match.index + match[0].length,
			type: 'hashtag',
			text: match[0],
		})
	}

	// Сортируем по позиции
	matches.sort((a, b) => a.start - b.start)

	// Собираем части
	matches.forEach((match) => {
		// Добавляем текст до совпадения
		if (match.start > lastIndex) {
			parts.push({
				text: content.substring(lastIndex, match.start),
				type: 'text',
			})
		}
		// Добавляем совпадение
		parts.push({
			text: match.text,
			type: match.type,
		})
		lastIndex = match.end
	})

	// Добавляем оставшийся текст
	if (lastIndex < content.length) {
		parts.push({
			text: content.substring(lastIndex),
			type: 'text',
		})
	}

	// Если нет совпадений, возвращаем обычный текст
	if (parts.length === 0) {
		return <span>{content}</span>
	}

	return (
		<span>
			{parts.map((part, index) => {
				if (part.type === 'mention') {
					return (
						<Text
							key={index}
							style={{
								color: '#3390ec',
								fontWeight: 500,
								cursor: 'pointer',
							}}
						>
							{part.text}
						</Text>
					)
				}
				if (part.type === 'hashtag') {
					return (
						<Text
							key={index}
							style={{
								color: '#52c41a',
								fontWeight: 500,
								cursor: 'pointer',
							}}
						>
							{part.text}
						</Text>
					)
				}
				return <span key={index}>{part.text}</span>
			})}
		</span>
	)
}

