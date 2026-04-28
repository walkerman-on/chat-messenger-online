import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Delete,
	UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Chats')
@Controller('chats')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatsController {
	constructor(private readonly chatsService: ChatsService) { }

	@Post()
	@ApiOperation({ summary: 'Create a new chat' })
	@ApiResponse({ status: 201, description: 'Chat created successfully' })
	create(@Body() createChatDto: CreateChatDto, @CurrentUser() user: any) {
		return this.chatsService.create(createChatDto, user.id);
	}

	@Get()
	@ApiOperation({ summary: 'Get all chats for current user' })
	@ApiResponse({ status: 200, description: 'List of chats' })
	findAll(@CurrentUser() user: any) {
		return this.chatsService.findAll(user.id);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get chat by ID' })
	@ApiResponse({ status: 200, description: 'Chat details' })
	findOne(@Param('id') id: string, @CurrentUser() user: any) {
		return this.chatsService.findOne(id, user.id);
	}

	@Post(':chatId/members/:memberId')
	@ApiOperation({ summary: 'Add member to chat' })
	@ApiResponse({ status: 200, description: 'Member added successfully' })
	addMember(@Param('chatId') chatId: string, @Param('memberId') memberId: string) {
		return this.chatsService.addMember(chatId, memberId);
	}

	@Delete(':chatId/members/:memberId')
	@ApiOperation({ summary: 'Remove member from chat' })
	@ApiResponse({ status: 200, description: 'Member removed successfully' })
	removeMember(@Param('chatId') chatId: string, @Param('memberId') memberId: string) {
		return this.chatsService.removeMember(chatId, memberId);
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Delete chat' })
	@ApiResponse({ status: 200, description: 'Chat deleted successfully' })
	remove(@Param('id') id: string, @CurrentUser() user: any) {
		return this.chatsService.remove(id, user.id);
	}
}





