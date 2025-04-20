
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';

@Controller('messages')
export class MessagesController {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
  ) {}

  @Post(':friendId')
  async getMessages(
    @Param('friendId') friendId: string,
    @Body('userId') userId: string,
  ) {
    return this.messagesRepository.find({
      where: [
        { sender: { userid: userId }, receiver: { userid: friendId } },
        { sender: { userid: friendId }, receiver: { userid: userId } }
      ],
      relations: ['sender', 'receiver'],
      order: { timestamp: 'ASC' }
    });
  }
}