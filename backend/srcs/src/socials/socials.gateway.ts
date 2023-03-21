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
import { Message, Participant, Role, Room, User } from '@prisma/client';
import { RoomsService } from './rooms/rooms.service';
import { MessagesService } from './rooms/messages/messages.service';
import { WsNotFoundException } from 'src/exceptions/ws-exceptions/ws-exceptions';
import { PrismaService } from 'src/prisma/prisma.service';
import { getStatusFromVisibility } from 'src/users/utils/friend-status';
import { ParticipantService } from './rooms/participant/participant.service';

@Injectable()
@UseFilters(new WsCatchAllFilter())
@WebSocketGateway({
  namespace: 'socials',
})
export class SocialsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private roomService: RoomsService,
    private messageService: MessagesService,
    private prisma: PrismaService,
    private participantService: ParticipantService,
  ) {}

  @WebSocketServer()
  public io: Namespace;

  //===== LIFECYCLE METHODS =====
  afterInit() {
    console.log('SocialsGateway initialized');
    this.io.on('connection', (socket) => {});
  }

  async handleConnection(client: AuthSocket) {
    client.join(client.userId);
    this.sendStatusUpdate(client.userId);
    const rooms = await this.roomService.findRoomsForUser(client.userId);
    rooms.map((room) => {
      client.join(room.id);
    });
  }

  async handleDisconnect(client: AuthSocket) {
    client.leave(client.userId);
    const rooms = await this.roomService.findRoomsForUser(client.userId);
    rooms.map((room) => {
      client.leave(room.id);
    });
  }

  //===== STATUS / VISIBILITY =====
  async sendStatusUpdate(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        preferences: true,
        friends: true,
      },
    });
    this.emitToUser(user.id, 'on-self-status-update', user.status);
    if (user.preferences.visibility == 'VISIBLE') {
      this.emitToList(user.friends, 'on-friend-update', {
        username: user.username,
        avatar: user.avatar,
        status: user.status,
        id: user.id,
      });
    }
  }

  async sendVisibilityUpdate(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        preferences: true,
        friends: true,
      },
    });
    this.emitToUser(
      userId,
      'on-visibility-update',
      user.preferences.visibility,
    );
    let status = getStatusFromVisibility(
      user.status,
      user.preferences.visibility,
    );
    this.emitToList(user.friends, 'on-friend-update', {
      username: user.username,
      avatar: user.avatar,
      status: status,
      id: user.id,
    });
  }

  //====== CHAT / MESSAGES / ROOMS ======
  @SubscribeMessage('new-message')
  async newMessage(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody()
    payload: { message: string; room: Room & { room: Participant[] } },
  ) {
    if (payload.message == '' || payload.message.length > 256) return;
    const sender = await this.prisma.user.findUnique({
      where: { id: client.userId },
    });
    if (!sender) throw new WsNotFoundException('Sender not found');
    const room = await this.roomService.findOneByName(payload.room.name);
    if (!room) throw new WsNotFoundException('Room not found');
    if (
      room.room.filter((participant) => participant.userId == sender.id)
        .length == 0
    )
      return;
    const message = await this.messageService.create({
      content: payload.message,
      senderId: sender.id,
      roomId: room.id,
    });
    this.io.to(room.id).emit('on-new-message', {
      sender: sender.username,
      message: payload.message,
      roomName: payload.room.name,
    });

    this.emitToUser(
      room.id,
      'on-chat-update',
      await this.roomService.createRoomReturnEntity(room, message),
    );
  }

  removeFriend(removerId: string, friendRemoved: string) {
    this.emitToUser(removerId, 'on-friend-remove', friendRemoved);
  }

  async addChatToHistory(
    ownerId: string,
    room: Room & { room: Participant[] },
    lastMessage: Message,
  ) {
    this.emitToUser(
      ownerId,
      'on-chat-update',
      await this.roomService.createRoomReturnEntity(room, lastMessage),
    );
  }

  async joinUserToRoom(room: any, users: string[]) {
    const owner = await this.prisma.user.findUnique({
      where: { id: room.ownerId },
    });
    users.push(owner.username);
    users.map(async (user) => {
      const participant = await this.prisma.user.findUnique({
        where: { username: user },
      });
      if (!participant)
        throw new WsNotFoundException(
          "Participant can't join the room, refresh the page",
        );
      const socketId = (
        await this.io.adapter.sockets(new Set([participant.id]))
      )
        .values()
        .next().value;
      if (!socketId) return;
      const socket = this.io.sockets.get(socketId);
      socket.join(room.id);
    });
  }

  async leaveUserFromRoom(roomId: string, userId: string) {
    const socketId = (await this.io.adapter.sockets(new Set([userId])))
      .values()
      .next().value;
    if (!socketId) return;
    const socket = this.io.sockets.get(socketId);
    socket.leave(roomId);
  }

  @SubscribeMessage('kick-player')
  async kickUser(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody()
    payload: {
      roomId: string;
      userIdKicked: string;
    },
  ) {
    const room = await this.prisma.room.findUnique({
      where: { id: payload.roomId },
      include: { room: true },
    });
    if (!room) return;

    const kicker = this.isInRoom(client.userId, room);
    if (!kicker || (kicker.role != Role.ADMIN && kicker.role != Role.OWNER))
      return;

    const newRoom = await this.roomService.leaveRoom(
      payload.userIdKicked,
      payload.roomId,
    );
    console.log(newRoom);
    if (!newRoom) return;
    this.leaveUserFromRoom(payload.roomId, payload.userIdKicked);

    this.emitToUser(payload.roomId, 'on-chat-update', {
      id: newRoom.id,
      participants: await this.participantService.createParticipantFromRoom(
        room,
      ),
    });

    this.emitToUser(payload.userIdKicked, 'on-chat-delete', {
      roomId: payload.roomId,
    });
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

  isInRoom(userId: string, room: Room & { room: Participant[] }) {
    const user = room.room.filter(
      (participant) => participant.userId == userId,
    );
    if (user.length == 0) return undefined;
    return user[0];
  }
}
