import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { Message } from './messages/message.entity';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ChatModule } from './chat/chat.module';
import { Friendship } from './friendship/friendship.entity';
import { MessagesModule } from './messages/messages.module';

@Module({
  imports: [
    AuthModule,
    ChatModule,
    MessagesModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mariadb',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User, Message, Friendship],
      synchronize: true,
      connectTimeout: 30000,
      extra: {
        authPlugins: {
          mysql_clear_password: () => () => Buffer.from(process.env.DB_PASSWORD + '\0')
        }
      }
    }),
  ],
})
export class AppModule {}
