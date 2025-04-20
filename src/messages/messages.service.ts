import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { User } from '../users/user.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async sendMessage(senderId: string, receiverId: string, content: string): Promise<Message> {
    const sender = await this.userRepository.findOneBy({ userid: senderId });
    const receiver = await this.userRepository.findOneBy({ userid: receiverId });
    
    const message = this.messageRepository.create({
      sender,
      receiver,
      content,
    });
    
    return this.messageRepository.save(message);
  }

  async getConversation(userId: string, otherUserId: string): Promise<Message[]> {
    return this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.receiver', 'receiver')
      .where('(sender.userid = :userId AND receiver.userid = :otherUserId)')
      .orWhere('(sender.userid = :otherUserId AND receiver.userid = :userId)')
      .setParameters({ userId, otherUserId })
      .orderBy('message.timestamp', 'ASC')
      .getMany();
  }
}