import { 
    Controller, 
    Post, 
    Body,
    Get, 
    } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { UsersService } from './user.service';
  import { FriendshipStatus } from 'src/friendship/friendship.entity';
  import { Repository } from 'typeorm';
  import { User } from './user.entity';
  import { Friendship } from 'src/friendship/friendship.entity';
  
  @Controller('users')
  export class UsersController {
    constructor(
      @InjectRepository(User)
      private readonly usersRepository: Repository<User>,
      @InjectRepository(Friendship)
      private readonly friendshipRepository: Repository<Friendship>,
      private readonly usersService: UsersService
    ) {}
  
    @Post('friends')
    async getFriends(@Body() body: { userId: string }) {
      console.log('User ID:', body.userId);
      const user = await this.usersRepository.findOne({ 
        where: { userid: body.userId },
      });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      const friendships = await this.friendshipRepository.find({
        where: [
          { user: { userid: user.userid }, status: FriendshipStatus.ACCEPTED },
          { friend: { userid: user.userid }, status: FriendshipStatus.ACCEPTED }
        ],
        relations: ['user', 'friend']
      });
  
      const friends = friendships.reduce((acc, friendship) => {
        const friend = 
          friendship.user.userid === user.userid 
            ? friendship.friend 
            : friendship.user;
        
        if (!acc.some(f => f.userid === friend.userid)) {
          acc.push(friend);
        }
        return acc;
      }, []);
  
      return friends;
    }
  }