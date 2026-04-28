import {
	Controller,
	Get,
	Post,
	Param,
	UseGuards,
	Query,
	Delete,
	Patch,
	Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FriendsService } from './friends.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateFriendRequestDto } from './dto/create-friend-request.dto';

@ApiTags('Friends')
@Controller('friends')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FriendsController {
	constructor(private readonly friendsService: FriendsService) { }

	@Get('search')
	@ApiOperation({ summary: 'Search users' })
	@ApiResponse({ status: 200, description: 'List of users matching query' })
	search(@Query('q') query: string) {
		return this.friendsService.searchUsers(query);
	}

	@Get('requests')
	@ApiOperation({ summary: 'Get pending friend requests' })
	@ApiResponse({ status: 200, description: 'List of pending friend requests' })
	getRequests(@CurrentUser() user: any) {
		return this.friendsService.getFriendRequests(user.id);
	}

	@Post('requests')
	@ApiOperation({ summary: 'Send friend request' })
	@ApiResponse({ status: 201, description: 'Friend request sent successfully' })
	sendRequest(@CurrentUser() user: any, @Body() dto: CreateFriendRequestDto) {
		return this.friendsService.sendFriendRequest(user.id, dto.receiverId);
	}

	@Patch('requests/:requestId/accept')
	@ApiOperation({ summary: 'Accept friend request' })
	@ApiResponse({ status: 200, description: 'Friend request accepted' })
	acceptRequest(@CurrentUser() user: any, @Param('requestId') requestId: string) {
		return this.friendsService.acceptFriendRequest(requestId, user.id);
	}

	@Patch('requests/:requestId/reject')
	@ApiOperation({ summary: 'Reject friend request' })
	@ApiResponse({ status: 200, description: 'Friend request rejected' })
	rejectRequest(@CurrentUser() user: any, @Param('requestId') requestId: string) {
		return this.friendsService.rejectFriendRequest(requestId, user.id);
	}

	@Get()
	@ApiOperation({ summary: 'Get friends list' })
	@ApiResponse({ status: 200, description: 'List of friends' })
	getFriends(@CurrentUser() user: any) {
		return this.friendsService.getFriends(user.id);
	}
}





