# Quick Start Guide

## Быстрый запуск для разработки

### 1. Установка зависимостей

```bash
cd backend
npm install
```

### 2. Настройка базы данных

Запустите PostgreSQL и Redis:

```bash
docker-compose up -d postgres redis
```

Или создайте локальные PostgreSQL и Redis серверы.

### 3. Настройка переменных окружения

Создайте `.env` файл:

```bash
cp env.example .env
```

Отредактируйте `.env` с вашими настройками.

### 4. Запуск в режиме разработки

```bash
npm run start:dev
```

Сервер запустится на http://localhost:3000

### 5. Проверка работы

- **Health Check**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api/docs

### 6. Тестирование API

#### Регистрация пользователя:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "username": "testuser",
    "firstName": "Test",
    "lastName": "User"
  }'
```

#### Вход:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### Получить профиль (с токеном):

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 7. Запуск через Docker (полный стек)

```bash
docker-compose up --build
```

Это запустит:
- Backend сервер
- PostgreSQL
- Redis

## Структура приложения

```
backend/
├── src/
│   ├── main.ts              # Точка входа
│   ├── app.module.ts        # Главный модуль
│   ├── modules/             # Модули приложения
│   └── common/              # Общие компоненты
├── docker-compose.yml       # Docker конфигурация
├── package.json             # Зависимости
└── README.md               # Полная документация
```

## Полезные команды

```bash
# Разработка
npm run start:dev

# Продакшн
npm run build
npm run start:prod

# Тесты
npm run test
npm run test:e2e

# Линтинг
npm run lint

# Форматирование кода
npm run format
```

## Troubleshooting

### База данных не подключается
- Убедитесь, что PostgreSQL запущен
- Проверьте `DATABASE_*` переменные в `.env`

### Redis не подключается
- Убедитесь, что Redis запущен
- Проверьте `REDIS_*` переменные в `.env`

### Порт уже используется
- Измените `PORT` в `.env`
- Или убейте процесс, занимающий порт 3000

### Ошибки миграций
- Убедитесь, что база данных существует
- TypeORM автоматически создаст схемы при `synchronize: true` в dev режиме

## Дополнительная документация

- [README.md](README.md) - Полная документация
- [docs/api-reference.md](docs/api-reference.md) - API Reference
- [Swagger UI](http://localhost:3000/api/docs) - Интерактивная документация






