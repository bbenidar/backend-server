import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './user.service';
import { UsersController } from './users.controller';  
import { Friendship } from '../friendship/friendship.entity'; 

@Module({
  imports: [TypeOrmModule.forFeature([User, Friendship])],
  providers: [UsersService], 
  controllers: [UsersController], 
  exports: [UsersService],
})
export class UsersModule {}