import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { PrismaClientExceptionFilter } from './common/filters/prisma-client-exception.filter';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import { validateEnv } from './config/env.validation';
import jwtConfig from './config/jwt.config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { CommentsModule } from './modules/comments/comments.module';
import { FriendshipsModule } from './modules/friendships/friendships.module';
import { GamesModule } from './modules/games/games.module';
import { GroupsModule } from './modules/groups/groups.module';
import { HealthModule } from './modules/health/health.module';
import { MessagesModule } from './modules/messages/messages.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PhotosModule } from './modules/photos/photos.module';
import { PostsModule } from './modules/posts/posts.module';
import { ShoppingCartModule } from './modules/shopping-cart/shopping-cart.module';
import { StoreModule } from './modules/store/store.module';
import { UploadModule } from './modules/upload/upload.module';
import { UsersModule } from './modules/users/users.module';
import { VideosModule } from './modules/videos/videos.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig],
      validate: validateEnv,
    }),
    DatabaseModule,
    AuthModule,
    CommentsModule,
    FriendshipsModule,
    GamesModule,
    GroupsModule,
    HealthModule,
    MessagesModule,
    NotificationsModule,
    OrdersModule,
    PhotosModule,
    PostsModule,
    ShoppingCartModule,
    StoreModule,
    UploadModule,
    UsersModule,
    VideosModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: PrismaClientExceptionFilter,
    },
  ],
})
export class AppModule {}
