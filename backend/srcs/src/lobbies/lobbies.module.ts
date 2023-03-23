import { forwardRef, Module } from '@nestjs/common';
import { LobbiesService } from './lobbies.service';
import { LobbiesController } from './lobbies.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';
import { LobbiesGateway } from './lobbies.gateway';
import { InvitationsModule } from 'src/invitations/invitations.module';
import { LobbyMembersModule } from './members/lobby-members.module';

@Module({
  imports: [
    PrismaModule,
    LobbyMembersModule,
    forwardRef(() => InvitationsModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [LobbiesController],
  providers: [LobbiesService, LobbiesGateway],
  exports: [LobbiesService, LobbiesGateway],
})
export class LobbiesModule {}
