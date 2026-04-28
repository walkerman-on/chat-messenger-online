import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseGuards,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiBearerAuth,
	ApiBody,
	ApiConsumes,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from './entities/user.entity';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
	constructor(private readonly usersService: UsersService) { }

	@Get()
	@ApiOperation({ summary: 'Get all users' })
	@ApiResponse({ status: 200, description: 'List of users' })
	findAll() {
		return this.usersService.findAll();
	}

	@Get('me')
	@ApiOperation({ summary: 'Get current user profile' })
	@ApiResponse({ status: 200, description: 'Current user information' })
	getProfile(@CurrentUser() user: User) {
		return user;
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get user by ID' })
	@ApiResponse({ status: 200, description: 'User information' })
	findOne(@Param('id') id: string) {
		return this.usersService.findById(id);
	}

	@Patch('me')
	@ApiOperation({ summary: 'Update current user profile' })
	@ApiResponse({ status: 200, description: 'User updated successfully' })
	update(@CurrentUser() user: User, @Body() updateUserDto: UpdateUserDto) {
		return this.usersService.update(user.id, updateUserDto);
	}

	@Post('me/avatar')
	@UseInterceptors(
		FileInterceptor('file', {
			storage: diskStorage({
				destination: './uploads/avatars',
				filename: (req, file, cb) => {
					const randomName = Array(32)
						.fill(null)
						.map(() => Math.round(Math.random() * 16).toString(16))
						.join('');
					cb(null, `${randomName}${extname(file.originalname)}`);
				},
			}),
			fileFilter: (req, file, cb) => {
				if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
					return cb(new Error('Only image files are allowed!'), false);
				}
				cb(null, true);
			},
			limits: {
				fileSize: 10 * 1024 * 1024, // 10MB
			},
		}),
	)
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				file: {
					type: 'string',
					format: 'binary',
				},
			},
		},
	})
	@ApiOperation({ summary: 'Upload user avatar' })
	async uploadAvatar(@CurrentUser() user: User, @UploadedFile() file: Express.Multer.File) {
		const avatarPath = `/uploads/avatars/${file.filename}`;
		return this.usersService.update(user.id, { avatar: avatarPath });
	}

	@Delete('me')
	@ApiOperation({ summary: 'Delete current user account' })
	@ApiResponse({ status: 200, description: 'User deleted successfully' })
	remove(@CurrentUser() user: User) {
		return this.usersService.remove(user.id);
	}
}

