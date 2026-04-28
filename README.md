# Telegram Clone

Полнофункциональный клон Telegram с бэкендом на NestJS и простым React UI для тестирования.

## 🚀 Быстрый старт

### 1. Запустите Docker контейнеры

```bash
cd backend
docker-compose up -d postgres redis
```

### 2. Запустите Backend

```bash
cd backend
npm install
npm run start:dev
```

Backend будет доступен на http://localhost:3000

### 3. Запустите Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend будет доступен на http://localhost:3001

## 📱 Функциональность

### Backend (NestJS)
- ✅ Регистрация и авторизация (JWT)
- ✅ Управление пользователями
- ✅ Система друзей (запросы, принятие/отклонение)
- ✅ Чаты (личные и групповые)
- ✅ Сообщения (текст, аудио, статусы доставки)
- ✅ Настройки приватности
- ✅ WebSocket для реального времени
- ✅ Swagger документация

### Frontend (React)
- ✅ Страница входа и регистрации
- ✅ Список чатов
- ✅ Отправка сообщений
- ✅ Поиск пользователей
- ✅ Создание чатов

## 📚 Документация

- **Backend**: [backend/README.md](backend/README.md)
- **API Reference**: http://localhost:3000/api/docs
- **Quick Start**: [backend/QUICKSTART.md](backend/QUICKSTART.md)
- **Frontend**: [frontend/README.md](frontend/README.md)

## 🛠 Технологии

### Backend
- NestJS 10
- TypeScript
- PostgreSQL
- Redis
- Socket.IO
- TypeORM

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Axios
- Socket.IO Client

## 📂 Структура проекта

```
telegram-clone/
├── backend/          # NestJS бэкенд
│   ├── src/          # Исходный код
│   ├── docker-compose.yml
│   └── README.md
├── frontend/         # React фронтенд
│   ├── src/          # Исходный код
│   └── README.md
└── README.md         # Этот файл
```

## 🔑 Основные API Endpoints

### Авторизация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/me` - Текущий пользователь

### Чаты
- `GET /api/chats` - Список чатов
- `POST /api/chats` - Создать чат
- `GET /api/chats/:id` - Получить чат

### Сообщения
- `GET /api/messages/chat/:chatId` - Получить сообщения
- `POST /api/messages` - Отправить сообщение

### Друзья
- `GET /api/friends` - Список друзей
- `GET /api/friends/search?q=query` - Поиск пользователей

## 🌐 WebSocket Events

Подключение к `/chat` namespace:

**Клиент → Сервер:**
- `send-message` - Отправить сообщение
- `join-chat` - Присоединиться к чату
- `typing-start/stop` - Индикатор набора

**Сервер → Клиент:**
- `new-message` - Новое сообщение
- `user-online/offline` - Статус пользователя

## 🐳 Docker

Для полного запуска через Docker:

```bash
cd backend
docker-compose up --build
```

## 📝 Пример использования

1. Откройте http://localhost:3001
2. Зарегистрируйтесь
3. Найдите других пользователей на странице Friends
4. Создайте чат и отправьте сообщение

## 🔒 Безопасность

- JWT токены с refresh механизмом
- Bcrypt хеширование паролей
- CORS настройки
- Валидация входных данных

## 📄 Лицензия

MIT






