
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { User } from './user.entity';
import { Friendship, FriendshipStatus } from '../friendship/friendship.entity';

@Injectable()
export class UsersService { 
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Friendship)
    private friendshipRepository: Repository<Friendship>,
  ) {}

  async getFriends(userId: string): Promise<User[]> {
    const friendships = await this.friendshipRepository.find({
      where: {
        userId: userId,
        status: FriendshipStatus.ACCEPTED,
      },
      relations: ['friend'],
    });

    return friendships.map(friendship => friendship.friend);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    console.log('Searching for email:', email);
    const user = await this.userRepository.findOne({ where: { email } });
    console.log('Found user:', user);
    return user;
  }

  async findOne(userId: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { userid: userId } });
  }
  
}