# Telegram Clone - Backend

Backend сервер для веб-клона Telegram с базовым функционалом: REST API, WebSocket для реального времени, документация и контейнеризация.

## Технологии

- **TypeScript** - основной язык разработки
- **NestJS** - прогрессивный Node.js фреймворк
- **PostgreSQL** - реляционная база данных
- **Redis** - кэширование и pub/sub
- **Socket.IO** - WebSocket для реального времени
- **BullMQ** - управление очередями
- **Docker** - контейнеризация
- **Swagger** - документация API

## Возможности

### Аутентификация
- ✅ Регистрация пользователей (email + пароль)
- ✅ JWT access/refresh токены
- ✅ Обновление токенов

### Пользователи
- ✅ Просмотр и редактирование профиля
- ✅ Загрузка аватара
- ✅ Статус (онлайн/офлайн)
- ✅ Username, имя, фамилия

### Друзья
- ✅ Поиск пользователей по username
- ✅ Отправка/принятие/отклонение запроса в друзья
- ✅ Список друзей

### Чаты
- ✅ Создание личных и групповых чатов
- ✅ Добавление/удаление участников
- ✅ Отметка онлайн/офлайн (через Redis pub/sub)

### Сообщения
- ✅ Текстовые сообщения
- ✅ Аудиосообщения
- ✅ Статус доставки (отправлено/доставлено/прочитано)
- ✅ Уведомления через Socket.IO

### Приватность
- ✅ Настройка "кто может писать" (все / только друзья)
- ✅ Фильтрация входящих сообщений

## Быстрый старт

### Требования

- Node.js 20+
- Docker и Docker Compose
- npm или yarn

### Установка

1. **Клонируйте репозиторий**
```bash
git clone <repository-url>
cd chat/backend
```

2. **Установите зависимости**
```bash
npm install
```

3. **Настройте переменные окружения**
```bash
cp .env.example .env
```

Отредактируйте `.env` файл при необходимости.

4. **Запустите через Docker**
```bash
docker-compose up --build
```

Или для разработки:
```bash
npm run start:dev
```

## API Endpoints

После запуска сервера документация Swagger доступна по адресу:
- **Swagger UI**: http://localhost:3000/api/docs

### Основные endpoints

#### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `POST /api/auth/refresh` - Обновить токен
- `GET /api/auth/me` - Текущий пользователь

#### Пользователи
- `GET /api/users` - Список пользователей
- `GET /api/users/:id` - Получить пользователя
- `PATCH /api/users/me` - Обновить профиль
- `POST /api/users/me/avatar` - Загрузить аватар
- `DELETE /api/users/me` - Удалить аккаунт

#### Друзья
- `GET /api/friends/search?q=query` - Поиск пользователей
- `GET /api/friends` - Список друзей
- `GET /api/friends/requests` - Запросы в друзья
- `POST /api/friends/requests/:userId` - Отправить запрос
- `PATCH /api/friends/requests/:requestId/accept` - Принять запрос
- `PATCH /api/friends/requests/:requestId/reject` - Отклонить запрос

#### Чаты
- `POST /api/chats` - Создать чат
- `GET /api/chats` - Список чатов
- `GET /api/chats/:id` - Получить чат
- `POST /api/chats/:chatId/members/:memberId` - Добавить участника
- `DELETE /api/chats/:chatId/members/:memberId` - Удалить участника
- `DELETE /api/chats/:id` - Удалить чат

#### Сообщения
- `POST /api/messages` - Отправить сообщение
- `GET /api/messages/chat/:chatId` - Получить сообщения
- `PATCH /api/messages/:id/delivered` - Пометить как доставленное
- `PATCH /api/messages/:id/read` - Пометить как прочитанное
- `DELETE /api/messages/:id` - Удалить сообщение

#### Настройки
- `GET /api/settings` - Получить настройки
- `PATCH /api/settings` - Обновить настройки

## WebSocket Events

Подключитесь к `/chat` namespace для использования реального времени.

### События клиента → сервера:
- `join-chat` - Присоединиться к чату
- `leave-chat` - Покинуть чат
- `send-message` - Отправить сообщение
- `typing-start` - Начать печать
- `typing-stop` - Остановить печать
- `mark-as-read` - Пометить как прочитанное

### События сервера → клиента:
- `new-message` - Новое сообщение
- `user-online` - Пользователь онлайн
- `user-offline` - Пользователь офлайн
- `user-typing` - Пользователь печатает
- `user-stopped-typing` - Пользователь перестал печатать

## Структура проекта

```
backend/
├── src/
│   ├── main.ts                 # Точка входа
│   ├── app.module.ts           # Главный модуль
│   ├── modules/                # Модули приложения
│   │   ├── auth/              # Аутентификация
│   │   ├── users/             # Пользователи
│   │   ├── friends/           # Друзья
│   │   ├── chats/             # Чаты
│   │   ├── messages/          # Сообщения
│   │   ├── settings/          # Настройки
│   │   └── websocket/         # WebSocket
│   └── common/                # Общие утилиты
│       ├── guards/            # Гарды
│       ├── decorators/        # Декораторы
│       └── strategies/        # Passport стратегии
├── docker-compose.yml         # Docker Compose конфигурация
├── Dockerfile                 # Docker образ
├── .env.example              # Пример переменных окружения
└── README.md                 # Документация
```

## Скрипты

```bash
# Разработка
npm run start:dev

# Продакшн
npm run start:prod

# Сборка
npm run build

# Тесты
npm run test
npm run test:e2e

# Линтинг
npm run lint

# Форматирование
npm run format
```

## Переменные окружения

Создайте файл `.env` на основе `.env.example`:

```env
NODE_ENV=development
PORT=3000
API_PREFIX=api

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=telegram_clone

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

## Лицензия

MIT






