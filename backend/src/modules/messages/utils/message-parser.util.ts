export interface ParsedMessage {
	text: string;
	mentions: string[]; // Usernames без @
	hashtags: string[]; // Hashtags без #
}

export function parseMessage(content: string): ParsedMessage {
	const mentions: string[] = [];
	const hashtags: string[] = [];

	// Регулярное выражение для упоминаний @username (поддерживает латиницу, кириллицу, цифры, подчеркивания)
	const mentionRegex = /@([a-zA-Zа-яА-ЯёЁ0-9_]+)/g;
	let match;
	while ((match = mentionRegex.exec(content)) !== null) {
		mentions.push(match[1]);
	}

	// Регулярное выражение для хештегов #tag (поддерживает латиницу, кириллицу, цифры)
	const hashtagRegex = /#([a-zA-Zа-яА-ЯёЁ0-9]+)/g;
	while ((match = hashtagRegex.exec(content)) !== null) {
		hashtags.push(match[1]);
	}

	return {
		text: content,
		mentions: [...new Set(mentions)], // Убираем дубликаты
		hashtags: [...new Set(hashtags)], // Убираем дубликаты
	};
}

export function extractTaskInfo(content: string): { hashtag: string | null; title: string } | null {
	const parsed = parseMessage(content);

	// Если есть хештег, создаем задачу
	if (parsed.hashtags.length > 0) {
		const hashtag = parsed.hashtags[0]; // Берем первый хештег

		// Убираем упоминания и хештеги из текста для создания заголовка
		let title = content
			.replace(/@[a-zA-Zа-яА-ЯёЁ0-9_]+/g, '') // Убираем упоминания
			.replace(/#[a-zA-Zа-яА-ЯёЁ0-9]+/g, '') // Убираем хештеги
			.replace(/\s+/g, ' ') // Убираем лишние пробелы
			.trim();

		// Если заголовок пустой, используем хештег как заголовок
		if (!title) {
			title = `Задача ${hashtag}`;
		}

		return {
			hashtag: `#${hashtag}`,
			title: title.substring(0, 200), // Ограничиваем длину
		};
	}

	return null;
}

