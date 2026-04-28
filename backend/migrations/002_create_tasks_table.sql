-- Migration: Create tasks table
-- Date: 2024

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	title VARCHAR(500) NOT NULL,
	description TEXT,
	hashtag VARCHAR(100) NOT NULL,
	status VARCHAR(20) NOT NULL DEFAULT 'open',
	chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
	created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
	due_date TIMESTAMP,
	created_at TIMESTAMP NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create task_assignees junction table
CREATE TABLE IF NOT EXISTS task_assignees (
	task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
	user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	PRIMARY KEY (task_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tasks_chat_id ON tasks(chat_id);
CREATE INDEX IF NOT EXISTS idx_tasks_hashtag ON tasks(hashtag);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_task_assignees_task_id ON task_assignees(task_id);
CREATE INDEX IF NOT EXISTS idx_task_assignees_user_id ON task_assignees(user_id);

-- Add constraint for status enum
ALTER TABLE tasks 
ADD CONSTRAINT check_task_status 
CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled'));

-- Add comment
COMMENT ON TABLE tasks IS 'Задачи, созданные из сообщений с хештегами';
COMMENT ON COLUMN tasks.hashtag IS 'Хештег задачи (например, #кв304)';
COMMENT ON COLUMN tasks.status IS 'Статус задачи: open, in_progress, completed, cancelled';

