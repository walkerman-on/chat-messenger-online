import { useState, useRef, useEffect } from 'react'
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react'
import { Button } from 'antd'
import { SmileOutlined } from '@ant-design/icons'
import { useTheme } from '@/app/providers/ThemeProvider'

interface EmojiPickerButtonProps {
	onEmojiClick: (emoji: string) => void
}

export const EmojiPickerButton = ({ onEmojiClick }: EmojiPickerButtonProps) => {
	const { isDark } = useTheme()
	const [isOpen, setIsOpen] = useState(false)
	const pickerRef = useRef<HTMLDivElement>(null)
	const buttonRef = useRef<HTMLDivElement>(null)
	const pickerContainerRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				pickerRef.current &&
				buttonRef.current &&
				!pickerRef.current.contains(event.target as Node) &&
				!buttonRef.current.contains(event.target as Node)
			) {
				setIsOpen(false)
			}
		}

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside)
			// Позиционируем picker относительно кнопки
			if (buttonRef.current && pickerContainerRef.current) {
				const buttonRect = buttonRef.current.getBoundingClientRect()
				const pickerWidth = 320
				const pickerHeight = 400
				const viewportWidth = window.innerWidth
				const viewportHeight = window.innerHeight

				// Вычисляем позицию: открываем снизу вверх, справа от кнопки
				let left = buttonRect.left
				let bottom = viewportHeight - buttonRect.top + 8

				// Если picker не помещается справа, открываем слева
				if (left + pickerWidth > viewportWidth) {
					left = buttonRect.right - pickerWidth
				}

				// Если picker не помещается снизу, открываем сверху
				if (bottom + pickerHeight > viewportHeight) {
					bottom = viewportHeight - buttonRect.bottom + pickerHeight + 8
				}

				// Убеждаемся, что picker не выходит за левую границу (не перекрывается с боковым меню)
				if (left < 360) {
					left = 360 + 8 // Отступ от бокового меню
				}

				pickerContainerRef.current.style.left = `${left}px`
				pickerContainerRef.current.style.bottom = `${bottom}px`
			}
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [isOpen])

	const handleEmojiClick = (emojiData: EmojiClickData) => {
		onEmojiClick(emojiData.emoji)
		setIsOpen(false)
	}

	return (
		<>
			<div style={{ position: 'relative' }} ref={buttonRef}>
				<Button
					type="text"
					icon={<SmileOutlined />}
					onClick={() => setIsOpen(!isOpen)}
					style={{
						color: 'var(--tg-text-secondary)',
						fontSize: 20,
						width: 40,
						height: 40,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						flexShrink: 0,
					}}
				/>
			</div>
			{isOpen && (
				<div
					ref={pickerContainerRef}
					style={{
						position: 'fixed',
						zIndex: 9999,
						borderRadius: 12,
						overflow: 'hidden',
						boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
					}}
				>
					<div ref={pickerRef}>
						<EmojiPicker
							onEmojiClick={handleEmojiClick}
							theme={isDark ? Theme.DARK : Theme.LIGHT}
							width={320}
							height={400}
							previewConfig={{
								showPreview: false,
							}}
							skinTonesDisabled
						/>
					</div>
				</div>
			)}
		</>
	)
}

