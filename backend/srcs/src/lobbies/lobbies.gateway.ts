import { UseFilters } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Namespace } from 'socket.io';
import { WsCatchAllFilter } from 'src/exceptions/ws-exceptions/ws-catch-all-filter';
import { AuthSocket } from 'src/socket-adapter/types/AuthSocket.types';
import { PrismaService } from 'src/prisma/prisma.service';
import { LobbiesService } from './lobbies.service';
@UseFilters(new WsCatchAllFilter())
@WebSocketGateway({
  namespace: 'lobbies',
})
export class LobbiesGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly lobbiesService: LobbiesService,
  ) {}

  @WebSocketServer()
  io: Namespace;

  afterInit(): void {}

  async handleConnection(client: AuthSocket) {
    client.join(client.userId);
    const lobby = await this.lobbiesService.findLobbyForUser(client.userId);
    if (lobby) {
      console.log('user ', client.username, ' is in lobby ', lobby.id);
      client.join(lobby.id);
    }
  }

  handleDisconnect(client: AuthSocket) {}

  @SubscribeMessage('join-lobby')
  async joinLobby(client: AuthSocket, lobbyId: string) {
    console.log('received join-lobby event');
    const user = await this.prisma.user.findUnique({
      where: { id: client.id },
    });
    const lobby = await this.lobbiesService.findLobbyForUser(client.userId);
    if (lobby) {
      client.join(lobby.id);
      this.io.to(lobby.id).emit('player-joined', { username: client.username });
    }
  }

  @SubscribeMessage('player-ready')
  async playerReady(client: AuthSocket, bool: boolean) {
    console.log('received player-ready event: ', bool ? 'true' : 'false');
  }

  @SubscribeMessage('leave-lobby')
  async leaveLobby(client: AuthSocket, lobbyId: string) {
    console.log('received leave-lobby event');
    //check if user is in said lobby
    //disconnect user from lobby in db
    //send lobby left update to users in lobby
  }
}
