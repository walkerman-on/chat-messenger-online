# Chat Frontend

Frontend приложение для чата на React, TypeScript, React Query и Ant Design с архитектурой FSD.

## Технологии

- **React 18** - UI библиотека
- **TypeScript** - типизация
- **React Query** - управление состоянием сервера
- **Ant Design** - UI компоненты
- **React Router** - маршрутизация
- **Socket.IO Client** - WebSocket для реального времени
- **Vite** - сборщик

## Архитектура FSD

Проект использует Feature-Sliced Design:

```
src/
├── app/          # Инициализация, провайдеры, роутинг
├── pages/        # Страницы приложения
├── widgets/      # Сложные UI блоки
├── features/     # Бизнес-логика
├── entities/     # Бизнес-сущности
└── shared/       # Переиспользуемый код
```

## Установка

```bash
npm install
```

## Запуск

```bash
npm run dev
```

Приложение будет доступно на http://localhost:5173

## Сборка

```bash
npm run build
```

## Структура

- **entities** - модели данных (User, Chat, Message, Friend) и API
- **features** - бизнес-логика (auth, chats, messages, friends, settings)
- **widgets** - сложные компоненты (ChatList, MessageList, FriendList)
- **pages** - страницы приложения
- **app** - провайдеры, роутинг, entrypoint
- **shared** - общие утилиты, конфигурация, API клиент

## Функционал

- ✅ Авторизация и регистрация
- ✅ Список чатов
- ✅ Создание чатов (личные и групповые)
- ✅ Отправка сообщений
- ✅ Поиск и добавление друзей
- ✅ Запросы в друзья
- ✅ Настройки приватности
- ✅ WebSocket для реального времени
