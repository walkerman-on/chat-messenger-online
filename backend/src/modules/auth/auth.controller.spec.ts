import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
	let controller: AuthController;
	let service: AuthService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [AuthController],
			providers: [
				{
					provide: AuthService,
					useValue: {
						register: jest.fn(),
						login: jest.fn(),
						refresh: jest.fn(),
					},
				},
			],
		}).compile();

		controller = module.get<AuthController>(AuthController);
		service = module.get<AuthService>(AuthService);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	it('should register a user', async () => {
		const registerDto = {
			email: 'test@example.com',
			password: 'password123',
			username: 'testuser',
			firstName: 'Test',
			lastName: 'User',
		};

		const result = {
			accessToken: 'token',
			refreshToken: 'refresh-token',
			user: { id: '1', ...registerDto },
		};

		jest.spyOn(service, 'register').mockResolvedValue(result as any);

		expect(await controller.register(registerDto)).toBe(result);
	});
});

