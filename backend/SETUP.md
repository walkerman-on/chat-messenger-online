# Setup Instructions

## Проблема: Не удается подключиться к базе данных

Приложение требует PostgreSQL и Redis для работы. Есть несколько способов установки:

## Вариант 1: Docker (Рекомендуется)

### 1. Запустите Docker Desktop

Убедитесь, что Docker Desktop запущен на вашем Mac.

### 2. Запустите контейнеры

```bash
cd backend
docker-compose up -d postgres redis
```

### 3. Проверьте статус

```bash
docker-compose ps
```

Должны быть запущены:
- `telegram-clone-postgres`
- `telegram-clone-redis`

## Вариант 2: Локальная установка PostgreSQL

### 1. Установите PostgreSQL через Homebrew

```bash
brew install postgresql@16
brew services start postgresql@16
```

### 2. Создайте базу данных

```bash
createdb telegram_clone
```

### 3. Обновите .env файл

Убедитесь, что настройки в `.env` корректны:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=ваш_username
DATABASE_PASSWORD=ваш_пароль
DATABASE_NAME=telegram_clone
```

## Вариант 3: Облачная база данных (Supabase, Railway, etc.)

Можно использовать бесплатную облачную базу данных:

1. Создайте аккаунт на [Supabase](https://supabase.com) или [Railway](https://railway.app)
2. Создайте новый PostgreSQL проект
3. Получите connection string
4. Обновите `.env` файл:

```env
DATABASE_HOST=ваш_хост
DATABASE_PORT=5432
DATABASE_USER=ваш_пользователь
DATABASE_PASSWORD=ваш_пароль
DATABASE_NAME=ваша_база
```

## Запуск приложения

После того как база данных запущена:

```bash
cd backend
npm run start:dev
```

Приложение автоматически создаст все необходимые таблицы при первом запуске (благодаря `synchronize: true` в dev режиме).

## Проверка работоспособности

- Health check: http://localhost:3000
- Swagger docs: http://localhost:3000/api/docs

## Troubleshooting

### Ошибка: "Connection refused"
- Убедитесь, что PostgreSQL запущен
- Проверьте порт 5432 не занят другим процессом
- Проверьте настройки в `.env` файле

### Ошибка: "database does not exist"
```bash
createdb telegram_clone
```

### Ошибка: "password authentication failed"
- Проверьте DATABASE_USER и DATABASE_PASSWORD в `.env`
- Для локального PostgreSQL можете использовать: `DATABASE_USER=your_mac_username`

## Дополнительно

Redis не обязателен для базовой функциональности, приложение будет работать и без него (с in-memory cache).






