import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../messages/message.entity';
import { User } from 'src/users/user.entity';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  
  private users: Map<string, string> = new Map();

  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
  ) {}

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.users.delete(client.id);
  }

@SubscribeMessage('join')
async handleJoin(@ConnectedSocket() client: Socket, @MessageBody() data: { userId: string }) {
  console.log(`Client ${client.id} joined with userId: ${data.userId}`);
  this.users.set(client.id, data.userId);
  console.log(`User ${data.userId} joined chat`);
  return { event: 'join', data: `Joined chat as ${data.userId}` };
}

@SubscribeMessage('message')
async handleMessage(
  @ConnectedSocket() client: Socket,
  @MessageBody() data: { senderId: string, receiverId: string, content: string }
) {
  console.log(`Message from ${client.id}: ${data.content}`);
  
 
  if (!data.senderId || !data.receiverId || !data.content) {
    return { event: 'error', data: 'Missing required fields' };
  }

 
  const message = new Message();
  message.sender = { userid: data.senderId } as User;
  message.receiver = { userid: data.receiverId } as User;
  message.content = data.content;
  message.timestamp = new Date();


  try {
    await this.messagesRepository.save(message);
  } catch (error) {
    console.error('Error saving message:', error);
    return { event: 'error', data: 'Failed to save message' };
  }


  const messageToSend = {
    content: data.content,
    timestamp: message.timestamp,
    senderId: data.senderId,
    receiverId: data.receiverId
  };


  let recipientSocketId = null;
  this.users.forEach((userId, socketId) => {
    if (userId === data.receiverId) {
      recipientSocketId = socketId;
    }
  });


  if (recipientSocketId) {
    this.server.to(recipientSocketId).emit('message', messageToSend);
  }


  return { event: 'message', data: messageToSend };
}
}