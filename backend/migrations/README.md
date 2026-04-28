# Миграции базы данных

## Применение миграций

### Способ 1: Через psql (PostgreSQL CLI)

```bash
# Подключитесь к базе данных
psql -h localhost -U postgres -d telegram_clone

# Выполните миграцию
\i migrations/001_add_security_level_to_chats.sql
```

### Способ 2: Через Docker

```bash
# Если база данных в Docker контейнере
docker exec -i telegram-clone-postgres psql -U postgres -d telegram_clone < migrations/001_add_security_level_to_chats.sql
```

### Способ 3: Через TypeORM CLI (если настроен)

```bash
npm run migration:run
```

## Список миграций

### 001_add_security_level_to_chats.sql
Добавляет поле `security_level` в таблицу `chats` для поддержки грифов секретности:
- `none` - без грифа (по умолчанию)
- `commercial` - коммерческая тайна
- `state` - государственная тайна

## Откат миграции

Если нужно откатить миграцию:

```sql
ALTER TABLE chats DROP CONSTRAINT IF EXISTS check_security_level;
ALTER TABLE chats DROP COLUMN IF EXISTS security_level;
```

## Примечания

- В режиме разработки (`NODE_ENV !== 'production'`) TypeORM автоматически синхронизирует схему БД
- В production рекомендуется использовать миграции вместо `synchronize: true`
- Все существующие чаты получат значение `'none'` по умолчанию

