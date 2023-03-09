import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Namespace } from 'socket.io';
import { Injectable, UseFilters } from '@nestjs/common';
import { WsCatchAllFilter } from 'src/exceptions/ws-exceptions/ws-catch-all-filter';
import { AuthSocket } from 'src/socket-adapter/types/AuthSocket.types';
import { User } from '@prisma/client';
import { UsersService } from 'src/users/users.service';

@Injectable()
@UseFilters(new WsCatchAllFilter())
@WebSocketGateway({
  namespace: 'socials',
})
export class SocialsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private usersService: UsersService) {}

  @WebSocketServer()
  public io: Namespace;

  afterInit() {
    console.log('SocialsGateway initialized');
    this.io.on('connection', (socket) => {});
  }

  async handleConnection(client: AuthSocket) {
    client.join(client.userId);
    const user = await this.usersService.findOne(client.userId);
    this.emitToList(
      await this.usersService.getUserFriends(client.userId),
      'on-status-update',
      { username: user.username, avatar: user.avatar, status: user.status },
    );
  }

  async handleDisconnect(client: AuthSocket) {
    client.leave(client.userId);
  }

  async sendStatusUpdate(userId: string): Promise<void> {
    const user = await this.usersService.findOne(userId);
    this.emitToList(
      await this.usersService.getUserFriends(userId),
      'on-status-update',
      { username: user.username, avatar: user.avatar, status: user.status },
    );
  }

  @SubscribeMessage('friend-request')
  async onFriendRequest(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() toUsername,
  ): Promise<void> {
    const user = await this.usersService.findOneByUsername(toUsername);
    this.emitToUser(user.id, 'on-friend-request', client.username);
  }

  @SubscribeMessage('friend-request-reply')
  async onFriendRequestReply(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() payload: { fromUsername: string; isReplyTrue: boolean },
  ): Promise<any> {
    const asker = await this.usersService.findOneByUsername(
      payload.fromUsername,
    );
    const replyer = await this.usersService.findOne(client.userId);
    if (payload.isReplyTrue === true)
      await this.usersService.addFriend(asker.id, replyer.id);
    else return;
    this.emitToUser(asker.id, 'on-status-update', {
      username: client.username,
      status: replyer.status,
      avatar: replyer.avatar,
    });
    this.emitToUser(client.id, 'on-status-update', {
      username: asker.username,
      status: asker.status,
      avatar: replyer.avatar,
    });
  }

  emitToUser(receiverId: string, eventName: string, data: any) {
    this.io.to(receiverId).emit(eventName, data);
  }

  emitToList(userListId: string[], eventName: string, data: any) {
    userListId.forEach((userId) => {
      this.emitToUser(userId, eventName, data);
    });
  }
}
