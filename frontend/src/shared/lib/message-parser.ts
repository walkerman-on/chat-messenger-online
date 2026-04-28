export interface ParsedMessage {
	text: string
	mentions: string[] // Usernames без @
	hashtags: string[] // Hashtags без #
}

export function parseMessage(content: string): ParsedMessage {
	const mentions: string[] = []
	const hashtags: string[] = []

	// Регулярное выражение для упоминаний @username (поддерживает латиницу, кириллицу, цифры, подчеркивания)
	const mentionRegex = /@([a-zA-Zа-яА-ЯёЁ0-9_]+)/g
	let match
	while ((match = mentionRegex.exec(content)) !== null) {
		mentions.push(match[1])
	}

	// Регулярное выражение для хештегов #tag (поддерживает латиницу, кириллицу, цифры)
	const hashtagRegex = /#([a-zA-Zа-яА-ЯёЁ0-9]+)/g
	while ((match = hashtagRegex.exec(content)) !== null) {
		hashtags.push(match[1])
	}

	return {
		text: content,
		mentions: [...new Set(mentions)], // Убираем дубликаты
		hashtags: [...new Set(hashtags)], // Убираем дубликаты
	}
}

export function isTaskCommand(content: string): { isCommand: boolean; hashtag?: string } {
	const trimmed = content.trim()
	if (trimmed.startsWith('/done')) {
		// Поддерживаем кириллицу в хештегах
		const hashtagMatch = trimmed.match(/#([a-zA-Zа-яА-ЯёЁ0-9]+)/)
		if (hashtagMatch) {
			return {
				isCommand: true,
				hashtag: `#${hashtagMatch[1]}`,
			}
		}
	}
	return { isCommand: false }
}

