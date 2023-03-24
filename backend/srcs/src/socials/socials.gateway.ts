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
import { Namespace, Socket } from 'socket.io';
import { Injectable, UseFilters } from '@nestjs/common';
import { WsCatchAllFilter } from 'src/exceptions/ws-exceptions/ws-catch-all-filter';
import { AuthSocket } from 'src/socket-adapter/types/AuthSocket.types';
import { Participant, Role, Room, User } from '@prisma/client';
import { WsNotFoundException } from 'src/exceptions/ws-exceptions/ws-exceptions';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMessageDto } from './rooms/messages/dto/create-message.dto';
import { ReturnRoomEntity } from './rooms/entities/room.entity';

@Injectable()
@UseFilters(new WsCatchAllFilter())
@WebSocketGateway({
  namespace: 'socials',
})
export class SocialsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private prisma: PrismaService) {}

  @WebSocketServer()
  public io: Namespace;

  afterInit() {
    console.log('SocialsGateway initialized');
    this.io.on('connection', (socket) => {});
  }

  async handleConnection(client: AuthSocket) {
    const rooms = await this.prisma.room.findMany({
      where: {
        participants: {
          some: {
            userId: client.userId,
          },
        },
      },
    });
    if (!rooms) return;
    await Promise.all(
      rooms.map((room) => {
        client.join(room.id);
      }),
    );
    await client.join(client.userId);
  }

  async handleDisconnect(client: AuthSocket) {}

  getSocketFromUserId(userId: string): Socket {
    const socketId = this.io.adapter.rooms.get(userId).values().next().value;
    return this.io.sockets.get(socketId);
  }

  sendMessageToRoom(message: CreateMessageDto) {
    const client = this.getSocketFromUserId(message.senderId);
    if (!client) return;
    client.to(message.roomId).emit('on-new-message', message);
    this.emitToUser(message.roomId, 'on-chat-update', {
      id: message.roomId,
      lastMessage: message.content,
    });
  }

  removeFriend(removerId: string, friendRemoved: string) {
    this.emitToUser(removerId, 'on-friend-remove', friendRemoved);
  }

  async joinUsersToRoom(room: any, usersId: string[]) {
    await Promise.all(
      usersId.map(async (userId) => {
        const participant = await this.prisma.user.findUnique({
          where: { id: userId },
        });
        if (!participant)
          throw new WsNotFoundException(
            "Participant can't join the room, refresh the page",
          );
        await this.joinUserToRoom(room.id, participant.id);
      }),
    );
  }

  async joinUserToRoom(roomId: string, userId: string) {
    const socketId = (await this.io.adapter.sockets(new Set([userId])))
      .values()
      .next().value;
    if (!socketId) return;
    const socket = this.io.sockets.get(socketId);
    await socket.join(roomId);
  }

  async leaveUserFromRoom(roomId: string, userId: string) {
    const socketId = (await this.io.adapter.sockets(new Set([userId])))
      .values()
      .next().value;
    if (!socketId) return;
    const socket = this.io.sockets.get(socketId);
    socket.leave(roomId);
  }

  //====== UTILS =====
  emitToListString(userList: string[], eventName: string, data: any) {
    userList.forEach((user) => {
      this.emitToUser(user, eventName, data);
    });
  }
  emitToUser(receiverId: string, eventName: string, data: any) {
    this.io.to(receiverId).emit(eventName, data);
  }

  emitToList(userList: User[], eventName: string, data: any) {
    userList.forEach((user) => {
      this.emitToUser(user.id, eventName, data);
    });
  }

  emitRoomCreated(ownerId: string, room: ReturnRoomEntity) {
    const socket = this.getSocketFromUserId(ownerId);
    if (!socket) return;
    socket.to(room.id).emit('on-chat-update', room);
  }
}
