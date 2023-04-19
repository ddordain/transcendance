import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateInvitationDto } from './dto/update-invitation.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  InvitationEntity,
  InvitationExtendedEntity,
} from './entities/invitation.entity';
import { SocialsGateway } from 'src/socials/socials.gateway';
import { InvitationType } from '@prisma/client';

@Injectable()
export class InvitationsService {
  constructor(
    private readonly prisma: PrismaService,
    private socialsGateway: SocialsGateway,
  ) {}

  async create(
    createInvitationDto: CreateInvitationDto,
    sender: any,
  ): Promise<InvitationExtendedEntity> {
    var invitation;
    if (createInvitationDto.type == 'FRIEND') {
      if (createInvitationDto.username == sender.username)
        throw new UnprocessableEntityException();
      invitation = await this.createFriendInvitation(
        createInvitationDto,
        sender,
      );
    } else if (createInvitationDto.type == 'LOBBY') {
      invitation = await this.createLobbyInvitation(createInvitationDto);
    }
    this.socialsGateway.emitToUser(invitation.userId, 'invitation', invitation);
    return invitation;
  }

  async createLobbyInvitation(
    createInvitationDto: CreateInvitationDto,
  ): Promise<InvitationExtendedEntity> {
    const lobby = await this.prisma.lobby.findUnique({
      where: { id: createInvitationDto.lobbyId },
    });
    //check lobby can be joined (game not started, lobby not full, sender is lobby owner)
    //TODO
    const invitation = await this.prisma.invitation.create({
      data: {
        type: createInvitationDto.type,
        userId: createInvitationDto.userId,
        lobbyId: lobby.id,
        isRead: false,
      },
    });
    return { ...invitation, userFromUsername: null };
  }

  async createFriendInvitation(
    createInvitationDto: CreateInvitationDto,
    sender: any,
  ): Promise<InvitationExtendedEntity> {
    const receiver = await this.prisma.user.findUnique({
      where: { username: createInvitationDto.username },
    });
    const invitation = await this.prisma.invitation.create({
      data: {
        type: createInvitationDto.type,
        userId: receiver.id,
        userFromId: sender.sub,
        isRead: false,
      },
    });
    return {
      ...invitation,
      userFromUsername: sender.username,
    };
  }

  async createMany(
    invitationDtoList: CreateInvitationDto[],
    senderId: string,
  ): Promise<InvitationEntity[]> {
    const invitations = await Promise.all(
      invitationDtoList.map(async (invitation) => {
        return await this.create(invitation, senderId);
      }),
    );
    return invitations;
  }

  async findForUser(userId: string) {
    const notifs = await this.prisma.invitation.findMany({
      where: {
        userId: userId,
      },
      include: {
        userFrom: true
      }
    })

    return notifs.map((notif) => {
      return {username: notif.userFrom.username, desc: this.createDesc(notif), userFromId: notif.userFromId, lobbyId: notif.lobbyId, userId: notif.userId, id: notif.id}
    })
  }

  async notifChecked(userId: string) {
    await this.prisma.invitation.updateMany({
      where: {
        userId: userId,
      },
      data: {
        isRead: true,
      },
    })

    const notifs = await this.prisma.invitation.findMany({
      where: {
        userId: userId,
      },
      include: {
        userFrom: true
      }
    })
    return notifs.map((notif) => {
      return {user: notif.userFrom.username, desc: this.createDesc(notif), type: notif.type, isRead: notif.isRead}
    })
  }

  createDesc(invitation: InvitationEntity) {
    switch(invitation.type) {
      case InvitationType.FRIEND:
        return "has sent you a friend request";
      case InvitationType.LOBBY:
        return "has invited you in a game";
    }
  }

  async findAll(): Promise<InvitationEntity[]> {
    return await this.prisma.invitation.findMany({});
  }

  async findOne(id: string): Promise<InvitationEntity> {
    return await this.prisma.invitation.findUnique({ where: { id } });
  }

  async decline(id: string, userId: string): Promise<InvitationEntity> {
    const invitation = await this.prisma.invitation.findFirst({
      where: {
        id: id,
        userId: userId,
      },
    });
    if (!invitation) throw new NotFoundException('Invitation not found');
    return await this.remove(invitation.id);
  }

  async update(
    id: string,
    updateInvitationDto: UpdateInvitationDto,
  ): Promise<InvitationEntity> {
    return await this.prisma.invitation.update({
      where: { id },
      data: updateInvitationDto,
    });
  }

  async remove(id: string): Promise<InvitationEntity> {
    return await this.prisma.invitation.delete({ where: { id } });
  }
}
