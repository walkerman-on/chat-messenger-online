# Настройка функционала задач

## Шаг 1: Применить миграции базы данных

Выполните миграцию для создания таблицы задач:

```bash
cd backend

# Вариант 1: Через psql
psql -h localhost -U postgres -d telegram_clone -f migrations/002_create_tasks_table.sql

# Вариант 2: Через Docker
docker exec -i telegram-clone-postgres psql -U postgres -d telegram_clone < migrations/002_create_tasks_table.sql
```

## Шаг 2: Перезапустить бэкенд

После применения миграции перезапустите бэкенд-сервер:

```bash
cd backend
npm run start:dev
```

## Шаг 3: Проверить работу

1. Откройте чат
2. Отправьте сообщение с хештегом: `@Иванов, проверь задвижку #кв304 до завтра`
3. Задача должна автоматически создаться и отобразиться над сообщениями

## Отладка

### Проверка в консоли браузера:
- Откройте DevTools (F12)
- Перейдите на вкладку Console
- При отправке сообщения с хештегом должны появиться логи:
  - `[TASK] Creating task from message: ...`
  - `[TASK] Task created successfully: ...`

### Проверка в консоли бэкенда:
- При отправке сообщения с хештегом должны появиться логи:
  - `[TASK] Creating task from message: ...`
  - `[TASK] Parsed message: ...`
  - `[TASK] Task created successfully: ...`

### Проверка API:
- Откройте Swagger: http://localhost:3000/api/docs
- Проверьте эндпоинт `GET /tasks/chat/:chatId`

## Возможные проблемы:

1. **Таблица tasks не существует** - примените миграцию
2. **Ошибка 404 при запросе задач** - проверьте, что TasksModule подключен в app.module.ts
3. **Задачи не создаются** - проверьте логи бэкенда на наличие ошибок
4. **Кириллица не работает** - убедитесь, что регулярные выражения обновлены (уже исправлено)

