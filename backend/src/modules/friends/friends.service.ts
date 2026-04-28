import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FriendRequest } from './entities/friend-request.entity';
import { User } from '../users/entities/user.entity';
import { FriendRequestStatus } from './entities/friend-request.entity';

@Injectable()
export class FriendsService {
	constructor(
		@InjectRepository(FriendRequest)
		private friendRequestRepository: Repository<FriendRequest>,
		@InjectRepository(User)
		private userRepository: Repository<User>,
	) { }

	async sendFriendRequest(senderId: string, receiverId: string) {
		if (senderId === receiverId) {
			throw new BadRequestException('Cannot send friend request to yourself');
		}

		const receiver = await this.userRepository.findOne({ where: { id: receiverId } });
		if (!receiver) {
			throw new NotFoundException('Receiver not found');
		}

		const existingRequest = await this.friendRequestRepository.findOne({
			where: [
				{ sender: { id: senderId }, receiver: { id: receiverId } },
				{ sender: { id: receiverId }, receiver: { id: senderId } },
			],
		});

		if (existingRequest) {
			throw new BadRequestException('Friend request already exists');
		}

		const request = this.friendRequestRepository.create({
			sender: { id: senderId } as User,
			receiver: { id: receiverId } as User,
		});

		return this.friendRequestRepository.save(request);
	}

	async getFriendRequests(userId: string) {
		return this.friendRequestRepository.find({
			where: { receiver: { id: userId }, status: FriendRequestStatus.PENDING },
			relations: ['sender'],
		});
	}

	async acceptFriendRequest(requestId: string, userId: string) {
		const request = await this.friendRequestRepository.findOne({
			where: { id: requestId, receiver: { id: userId } },
			relations: ['sender', 'receiver'],
		});

		if (!request) {
			throw new NotFoundException('Friend request not found');
		}

		request.status = FriendRequestStatus.ACCEPTED;
		return this.friendRequestRepository.save(request);
	}

	async rejectFriendRequest(requestId: string, userId: string) {
		const request = await this.friendRequestRepository.findOne({
			where: { id: requestId, receiver: { id: userId } },
		});

		if (!request) {
			throw new NotFoundException('Friend request not found');
		}

		request.status = FriendRequestStatus.REJECTED;
		return this.friendRequestRepository.save(request);
	}

	async getFriends(userId: string) {
		const acceptedRequests = await this.friendRequestRepository.find({
			where: { status: FriendRequestStatus.ACCEPTED },
			relations: ['sender', 'receiver'],
		});

		const friends = acceptedRequests
			.filter((req) => req.sender.id === userId || req.receiver.id === userId)
			.map((req) => (req.sender.id === userId ? req.receiver : req.sender));

		return friends;
	}

	async searchUsers(query: string) {
		return this.userRepository
			.createQueryBuilder('user')
			.where('user.username ILIKE :query', { query: `%${query}%` })
			.orWhere('user.firstName ILIKE :query', { query: `%${query}%` })
			.orWhere('user.lastName ILIKE :query', { query: `%${query}%` })
			.getMany();
	}
}

