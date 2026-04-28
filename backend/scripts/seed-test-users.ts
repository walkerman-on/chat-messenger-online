import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { User, UserStatus } from '../src/modules/users/entities/user.entity';
import { PrivacySettings, MessagePrivacy } from '../src/modules/settings/entities/privacy-settings.entity';
import { Message } from '../src/modules/messages/entities/message.entity';
import { FriendRequest } from '../src/modules/friends/entities/friend-request.entity';
import { Chat } from '../src/modules/chats/entities/chat.entity';
import { Task } from '../src/modules/tasks/entities/task.entity';

// Загружаем переменные окружения
config();

const testUsers = [
	{
		email: 'ivan.petrov@example.com',
		password: 'password123',
		username: 'ivan_petrov',
		firstName: 'Иван',
		lastName: 'Петров',
		bio: 'Старший разработчик с опытом работы в крупных IT-компаниях. Увлекаюсь веб-разработкой и машинным обучением.',
		position: 'Старший разработчик',
		department: 'Отдел разработки',
		currentProject: 'Внутренний мессенджер',
		status: UserStatus.ONLINE,
	},
	{
		email: 'maria.sidorova@example.com',
		password: 'password123',
		username: 'maria_sidorova',
		firstName: 'Мария',
		lastName: 'Сидорова',
		bio: 'UX/UI дизайнер с фокусом на создание интуитивных интерфейсов. Люблю работать с пользовательским опытом и проводить исследования.',
		position: 'UX/UI дизайнер',
		department: 'Отдел дизайна',
		currentProject: 'Редизайн корпоративного портала',
		status: UserStatus.ONLINE,
	},
	{
		email: 'alex.kuznetsov@example.com',
		password: 'password123',
		username: 'alex_kuznetsov',
		firstName: 'Алексей',
		lastName: 'Кузнецов',
		bio: 'Менеджер проектов с опытом управления командами разработки. Специализируюсь на Agile методологиях.',
		position: 'Менеджер проектов',
		department: 'Отдел управления проектами',
		currentProject: 'Внедрение системы управления задачами',
		status: UserStatus.AWAY,
	},
	{
		email: 'elena.volkova@example.com',
		password: 'password123',
		username: 'elena_volkova',
		firstName: 'Елена',
		lastName: 'Волкова',
		bio: 'QA инженер с глубоким пониманием процессов тестирования. Специализируюсь на автоматизированном тестировании.',
		position: 'QA инженер',
		department: 'Отдел тестирования',
		currentProject: 'Автоматизация тестирования API',
		status: UserStatus.OFFLINE,
	},
	{
		email: 'dmitry.ivanov@example.com',
		password: 'password123',
		username: 'dmitry_ivanov',
		firstName: 'Дмитрий',
		lastName: 'Иванов',
		bio: 'DevOps инженер с опытом настройки CI/CD пайплайнов и управления облачной инфраструктурой.',
		position: 'DevOps инженер',
		department: 'Отдел инфраструктуры',
		currentProject: 'Миграция в облако',
		status: UserStatus.ONLINE,
	},
	{
		email: 'anna.smirnova@example.com',
		password: 'password123',
		username: 'anna_smirnova',
		firstName: 'Анна',
		lastName: 'Смирнова',
		bio: 'Аналитик данных с опытом работы с большими объемами информации. Использую Python и SQL для анализа.',
		position: 'Аналитик данных',
		department: 'Отдел аналитики',
		currentProject: 'Анализ пользовательского поведения',
		status: UserStatus.ONLINE,
	},
	{
		email: 'sergey.kozlov@example.com',
		password: 'password123',
		username: 'sergey_kozlov',
		firstName: 'Сергей',
		lastName: 'Козлов',
		bio: 'Технический директор с опытом управления техническими командами и разработки стратегии развития продукта.',
		position: 'Технический директор',
		department: 'Руководство',
		currentProject: 'Стратегия развития платформы',
		status: UserStatus.ONLINE,
	},
];

async function seedTestUsers() {
	const dataSource = new DataSource({
		type: 'postgres',
		host: process.env.DATABASE_HOST || 'localhost',
		port: parseInt(process.env.DATABASE_PORT || '5432'),
		username: process.env.DATABASE_USER || 'postgres',
		password: process.env.DATABASE_PASSWORD || 'postgres',
		database: process.env.DATABASE_NAME || 'telegram_clone',
		entities: [User, Chat, Message, FriendRequest, PrivacySettings, Task],
		synchronize: false,
		logging: true,
	});

	try {
		await dataSource.initialize();
		console.log('✅ Подключение к базе данных установлено');

		const userRepository = dataSource.getRepository(User);
		const privacySettingsRepository = dataSource.getRepository(PrivacySettings);
		const messageRepository = dataSource.getRepository(Message);
		const friendRequestRepository = dataSource.getRepository(FriendRequest);
		const chatRepository = dataSource.getRepository(Chat);
		const taskRepository = dataSource.getRepository(Task);

		// Удаляем все связанные данные
		console.log('🗑️  Удаление всех связанных данных...');
		
		// Удаляем в правильном порядке с учетом внешних ключей
		// Сначала удаляем связи в промежуточных таблицах
		await dataSource.query('DELETE FROM task_assignees');
		console.log('   ✓ Связи исполнителей задач удалены');
		
		await dataSource.query('DELETE FROM chat_members');
		console.log('   ✓ Связи участников чатов удалены');

		// Затем удаляем таблицы с зависимостями
		await dataSource.query('DELETE FROM tasks');
		console.log('   ✓ Задачи удалены');
		
		await dataSource.query('DELETE FROM messages');
		console.log('   ✓ Сообщения удалены');

		await dataSource.query('DELETE FROM friend_requests');
		console.log('   ✓ Заявки в друзья удалены');

		await dataSource.query('DELETE FROM privacy_settings');
		console.log('   ✓ Настройки приватности удалены');

		await dataSource.query('DELETE FROM chats');
		console.log('   ✓ Чаты удалены');

		// В конце удаляем пользователей
		await dataSource.query('DELETE FROM users');
		console.log('   ✓ Пользователи удалены');

		// Создаем тестовых пользователей
		console.log('👥 Создание тестовых пользователей...');
		const createdUsers: User[] = [];

		for (const userData of testUsers) {
			const hashedPassword = await bcrypt.hash(userData.password, 10);
			
			const user = userRepository.create({
				email: userData.email,
				password: hashedPassword,
				username: userData.username,
				firstName: userData.firstName,
				lastName: userData.lastName,
				bio: userData.bio,
				position: userData.position,
				department: userData.department,
				currentProject: userData.currentProject,
				status: userData.status,
				lastSeen: new Date(),
				isActive: true,
				twoFactorEnabled: false,
			});

			const savedUser = await userRepository.save(user);
			createdUsers.push(savedUser);

			// Создаем настройки приватности для каждого пользователя
			const privacySettings = privacySettingsRepository.create({
				user: savedUser,
				whoCanMessageMe: MessagePrivacy.EVERYONE,
				allowFriendRequests: true,
				showOnlineStatus: true,
				showReadReceipts: true,
			});
			await privacySettingsRepository.save(privacySettings);

			console.log(`   ✓ Создан пользователь: ${userData.firstName} ${userData.lastName} (${userData.email})`);
		}

		console.log(`\n✅ Успешно создано ${createdUsers.length} тестовых пользователей!`);
		console.log('\n📋 Учетные данные для входа:');
		console.log('   Все пользователи имеют пароль: password123\n');
		
		testUsers.forEach((user, index) => {
			console.log(`   ${index + 1}. ${user.email} / ${user.username}`);
		});

	} catch (error) {
		console.error('❌ Ошибка при выполнении скрипта:', error);
		process.exit(1);
	} finally {
		await dataSource.destroy();
		console.log('\n✅ Соединение с базой данных закрыто');
	}
}

seedTestUsers();

