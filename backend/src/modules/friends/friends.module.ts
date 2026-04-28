import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { FriendRequest } from './entities/friend-request.entity';
import { User } from '../users/entities/user.entity';

@Module({
	imports: [TypeOrmModule.forFeature([FriendRequest, User])],
	controllers: [FriendsController],
	providers: [FriendsService],
	exports: [FriendsService],
})
export class FriendsModule { }






