import { useEffect, useRef, ReactNode, useState } from 'react'
import { SecurityLevel } from '@/entities/chat'
import { Modal, message } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'

interface SecurityProtectionProps {
	securityLevel: SecurityLevel | undefined
	children: ReactNode
	chatId?: string
}

export const SecurityProtection = ({ securityLevel, children, chatId }: SecurityProtectionProps) => {
	const containerRef = useRef<HTMLDivElement>(null)
	const [screenshotWarningVisible, setScreenshotWarningVisible] = useState(false)
	const screenshotAttemptsRef = useRef(0)
	const lastScreenshotAttemptRef = useRef<number>(0)

	useEffect(() => {
		if (!securityLevel || securityLevel === 'none') return

		const container = containerRef.current
		if (!container) return

		// Запрет контекстного меню (правый клик)
		const handleContextMenu = (e: MouseEvent) => {
			e.preventDefault()
			return false
		}

		// Запрет копирования текста
		const handleCopy = (e: ClipboardEvent) => {
			e.preventDefault()
			return false
		}

		// Запрет выделения текста
		const handleSelectStart = (e: Event) => {
			if (securityLevel === 'state') {
				e.preventDefault()
				return false
			}
		}

		// Запрет перетаскивания
		const handleDragStart = (e: DragEvent) => {
			e.preventDefault()
			return false
		}

		// Защита от скриншотов и DevTools
		// В браузере полная защита невозможна, но можно усложнить и логировать попытки
		const handleKeyDown = (e: KeyboardEvent) => {
			if (securityLevel === 'commercial' || securityLevel === 'state') {
				// Блокируем Print Screen и комбинации для скриншотов
				if (
					e.key === 'PrintScreen' ||
					(e.ctrlKey && e.shiftKey && e.key === 'S') ||
					(e.metaKey && e.shiftKey && e.key === '3') || // macOS скриншот
					(e.metaKey && e.shiftKey && e.key === '4') || // macOS скриншот области
					(e.metaKey && e.shiftKey && e.key === '5')    // macOS скриншот окна
				) {
					e.preventDefault()
					const now = Date.now()
					// Логируем попытку, но не чаще раза в секунду
					if (now - lastScreenshotAttemptRef.current > 1000) {
						screenshotAttemptsRef.current++
						lastScreenshotAttemptRef.current = now

						// Показываем предупреждение
						if (screenshotAttemptsRef.current === 1) {
							setScreenshotWarningVisible(true)
						} else {
							message.error({
								content: `⚠️ Попытка создания скриншота зафиксирована! (${screenshotAttemptsRef.current})`,
								duration: 5,
								icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
							})
						}

						// Логируем на бэкенд (если есть chatId)
						if (chatId) {
							// TODO: Отправить событие на бэкенд для логирования
							console.warn(`[SECURITY] Попытка скриншота в чате ${chatId}. Попытка #${screenshotAttemptsRef.current}`)
						}
					}
					return false
				}

				// Блокируем открытие DevTools (только для гос. тайны)
				if (securityLevel === 'state') {
					if (
						e.key === 'F12' ||
						(e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
						(e.ctrlKey && e.key === 'U') ||
						(e.metaKey && e.altKey && e.key === 'I') // macOS DevTools
					) {
						e.preventDefault()
						message.warning('⚠️ Использование инструментов разработчика запрещено в чатах с грифом "Гос. тайна"')
						return false
					}
				}
			}
		}

		// Обнаружение потери фокуса (возможная попытка скриншота через внешние инструменты)
		const handleBlur = () => {
			if (securityLevel === 'commercial' || securityLevel === 'state') {
				// Небольшая задержка, чтобы не срабатывать на обычное переключение вкладок
				setTimeout(() => {
					if (document.hidden) {
						console.warn('[SECURITY] Окно потеряло фокус в секретном чате')
					}
				}, 100)
			}
		}

		// Обнаружение изменения видимости страницы
		const handleVisibilityChange = () => {
			if ((securityLevel === 'commercial' || securityLevel === 'state') && document.hidden) {
				console.warn('[SECURITY] Страница скрыта в секретном чате')
			}
		}

		// Защита от DevTools через обнаружение изменения размеров окна
		let devToolsCheckInterval: number | null = null
		if (securityLevel === 'state') {
			const detectDevTools = () => {
				const threshold = 160
				const widthThreshold = window.outerWidth - window.innerWidth > threshold
				const heightThreshold = window.outerHeight - window.innerHeight > threshold

				if (widthThreshold || heightThreshold) {
					// DevTools открыт - можно показать предупреждение или закрыть чат
					console.warn('⚠️ Обнаружены инструменты разработчика. Доступ к секретному чату ограничен.')
				}
			}
			devToolsCheckInterval = setInterval(detectDevTools, 1000)
		}

		// CSS для запрета выделения
		if (securityLevel === 'state') {
			container.style.userSelect = 'none'
			container.style.setProperty('-webkit-user-select', 'none')
			container.style.setProperty('-moz-user-select', 'none')
			container.style.setProperty('-ms-user-select', 'none')
		}

		container.addEventListener('contextmenu', handleContextMenu)
		container.addEventListener('copy', handleCopy)
		container.addEventListener('selectstart', handleSelectStart)
		container.addEventListener('dragstart', handleDragStart)
		document.addEventListener('keydown', handleKeyDown)
		window.addEventListener('blur', handleBlur)
		document.addEventListener('visibilitychange', handleVisibilityChange)

		return () => {
			container.removeEventListener('contextmenu', handleContextMenu)
			container.removeEventListener('copy', handleCopy)
			container.removeEventListener('selectstart', handleSelectStart)
			container.removeEventListener('dragstart', handleDragStart)
			document.removeEventListener('keydown', handleKeyDown)
			window.removeEventListener('blur', handleBlur)
			document.removeEventListener('visibilitychange', handleVisibilityChange)
			if (devToolsCheckInterval) {
				clearInterval(devToolsCheckInterval)
			}
			if (securityLevel === 'state') {
				container.style.userSelect = ''
				container.style.removeProperty('-webkit-user-select')
				container.style.removeProperty('-moz-user-select')
				container.style.removeProperty('-ms-user-select')
			}
		}
	}, [securityLevel])

	// Добавляем водяной знак для секретных чатов
	const getWatermarkStyle = () => {
		if (!securityLevel || securityLevel === 'none') return {}

		const watermarkText = securityLevel === 'state'
			? 'ГОСУДАРСТВЕННАЯ ТАЙНА'
			: 'КОММЕРЧЕСКАЯ ТАЙНА'

		return {
			position: 'relative' as const,
			'&::before': {
				content: `"${watermarkText}"`,
				position: 'absolute',
				top: '50%',
				left: '50%',
				transform: 'translate(-50%, -50%) rotate(-45deg)',
				fontSize: '48px',
				color: 'rgba(255, 0, 0, 0.1)',
				pointerEvents: 'none',
				zIndex: 1000,
				userSelect: 'none',
			},
		}
	}

	return (
		<>
			<Modal
				title={
					<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
						<ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />
						<span>Обнаружена попытка создания скриншота</span>
					</div>
				}
				open={screenshotWarningVisible}
				onOk={() => setScreenshotWarningVisible(false)}
				onCancel={() => setScreenshotWarningVisible(false)}
				okText="Понял"
				cancelButtonProps={{ style: { display: 'none' } }}
				width={450}
			>
				<div style={{ padding: '16px 0' }}>
					<p style={{ marginBottom: 12, fontSize: 14 }}>
						<strong>Внимание!</strong> Создание скриншотов в чатах с грифом секретности <strong>запрещено</strong>.
					</p>
					<div style={{
						background: '#fff2f0',
						padding: 12,
						borderRadius: 6,
						borderLeft: '3px solid #ff4d4f',
					}}>
						<p style={{ margin: 0, fontSize: 13, color: '#cf1322' }}>
							Все попытки создания скриншотов <strong>логируются</strong> и могут быть переданы службе безопасности.
						</p>
					</div>
					<p style={{ marginTop: 12, marginBottom: 0, fontSize: 12, color: '#8c8c8c' }}>
						Попытка #{screenshotAttemptsRef.current}
					</p>
				</div>
			</Modal>
			<div
				ref={containerRef}
				style={{
					position: 'relative',
					width: '100%',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					minHeight: 0,
					...(securityLevel === 'state' ? {
						userSelect: 'none',
						WebkitUserSelect: 'none',
						MozUserSelect: 'none',
						msUserSelect: 'none',
					} : {}),
				}}
			>
				{children}
				{securityLevel && securityLevel !== 'none' && (
					<div
						style={{
							position: 'absolute',
							top: '50%',
							left: '50%',
							transform: 'translate(-50%, -50%) rotate(-45deg)',
							fontSize: '48px',
							fontWeight: 'bold',
							color: securityLevel === 'state'
								? 'rgba(255, 0, 0, 0.05)'
								: 'rgba(255, 165, 0, 0.05)',
							pointerEvents: 'none',
							zIndex: 1,
							userSelect: 'none',
							whiteSpace: 'nowrap',
						}}
					>
						{securityLevel === 'state'
							? 'ГОСУДАРСТВЕННАЯ ТАЙНА'
							: 'КОММЕРЧЕСКАЯ ТАЙНА'}
					</div>
				)}
			</div>
		</>
	)
}

