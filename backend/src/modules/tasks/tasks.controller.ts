import {
	Controller,
	Get,
	Post,
	Patch,
	Delete,
	Param,
	Body,
	UseGuards,
	Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from './entities/task.entity';

@ApiTags('Tasks')
@Controller('tasks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TasksController {
	constructor(private readonly tasksService: TasksService) { }

	@Post()
	@ApiOperation({ summary: 'Create a task' })
	@ApiResponse({ status: 201, description: 'Task created successfully' })
	create(@Body() createTaskDto: CreateTaskDto, @CurrentUser() user: any) {
		return this.tasksService.create(createTaskDto, user.id);
	}

	@Get('chat/:chatId')
	@ApiOperation({ summary: 'Get tasks for a chat' })
	@ApiResponse({ status: 200, description: 'List of tasks' })
	getByChat(@Param('chatId') chatId: string) {
		return this.tasksService.findByChat(chatId);
	}

	@Get('my/assigned')
	@ApiOperation({ summary: 'Get tasks assigned to current user' })
	@ApiResponse({ status: 200, description: 'List of assigned tasks' })
	getMyTasks(@CurrentUser() user: any) {
		return this.tasksService.findAssignedToUser(user.id);
	}

	@Get('my/delegated')
	@ApiOperation({ summary: 'Get tasks created by current user' })
	@ApiResponse({ status: 200, description: 'List of delegated tasks' })
	getDelegatedTasks(@CurrentUser() user: any) {
		return this.tasksService.findCreatedByUser(user.id);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get task by ID' })
	@ApiResponse({ status: 200, description: 'Task details' })
	getOne(@Param('id') id: string) {
		return this.tasksService.findOne(id);
	}

	@Patch(':id/status')
	@ApiOperation({ summary: 'Update task status' })
	@ApiResponse({ status: 200, description: 'Task status updated' })
	updateStatus(
		@Param('id') id: string,
		@Body('status') status: TaskStatus,
		@CurrentUser() user: any,
	) {
		return this.tasksService.updateStatus(id, status, user.id);
	}

	@Post('complete')
	@ApiOperation({ summary: 'Complete task by hashtag' })
	@ApiResponse({ status: 200, description: 'Task completed' })
	completeByHashtag(
		@Body('chatId') chatId: string,
		@Body('hashtag') hashtag: string,
		@CurrentUser() user: any,
	) {
		return this.tasksService.completeByHashtag(chatId, hashtag, user.id);
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Delete task' })
	@ApiResponse({ status: 200, description: 'Task deleted' })
	delete(@Param('id') id: string, @CurrentUser() user: any) {
		return this.tasksService.delete(id, user.id);
	}
}

