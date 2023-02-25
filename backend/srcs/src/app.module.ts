import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { AuthService } from './auth/auth.service';
import { PrismaModule } from './prisma/prisma.module';
import { ItemsModule } from './items/items.module';
import { UsersModule } from './users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { RoomsModule } from './rooms/rooms.module';
import { HttpModule } from '@nestjs/axios';
import { GameModule } from './game/game.module';
import { FriendshipController } from './friendship/friendship.controller';
import { FriendshipModule } from './friendship/friendship.module';
import { FriendshipService } from './friendship/friendship.service';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    ItemsModule,
    UsersModule,
    RoomsModule,
    JwtModule,
    HttpModule,
    GameModule,
    FriendshipModule,
  ],
  controllers: [AppController, FriendshipController],
  providers: [AppService, AuthService, PrismaService, FriendshipService],
})
export class AppModule {}
