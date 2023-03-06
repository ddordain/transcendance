import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { OnModuleInit, UseGuards } from '@nestjs/common';
import { Socket } from 'socket.io';
import { FriendsActivityService } from './friends-activity.service';
import { RoomsService } from 'src/rooms/rooms.service';

@WebSocketGateway({
  namespace: '/status',
  cors: {
    credentials: true,
    origin: ['http://localhost:3002'],
    methods: ['GET', 'POST'],
  },
})
// @UseGuards(AccessAuthGard) to add
export class FriendsActivityGateway
  implements OnModuleInit, OnGatewayConnection
{
  constructor(
    private friendsActivityService: FriendsActivityService,
  ) {}

  @WebSocketServer()
  public server: Server;

  onModuleInit() {
    this.server.on('connection', (socket) => {});
  }

  afterInit(server: Server) {
    this.friendsActivityService.server = server;
  }

  async handleConnection(client: Socket) {
    this.friendsActivityService.handleConnection(client);
  }

  @SubscribeMessage('status-update')
  async onStatusUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() status,
  ): Promise<void> {
    this.friendsActivityService.onStatusUpdate(client, status);
  }

  @SubscribeMessage('friend-request')
  async onFriendRequest(
    @ConnectedSocket() client: Socket,
    @MessageBody() toUsername,
  ): Promise<void> {
    this.friendsActivityService.onFriendRequest(client, toUsername);
  }

  @SubscribeMessage('friend-request-reply')
  async onFriendRequestReply(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { fromUsername: string; isReplyTrue: boolean },
  ): Promise<any> {
    this.friendsActivityService.onFriendRequestReply(client, payload);
  }

  @SubscribeMessage('logout')
  async onLogout(
    @ConnectedSocket() client: Socket,
    @MessageBody() userId,
  ): Promise<void> {
    this.friendsActivityService.onLogout(client, userId);
  }

  @SubscribeMessage("send-message")
  async sendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { message: string, users: string[]}) {
      this.friendsActivityService.sendMessage(client, payload);
    }
}


