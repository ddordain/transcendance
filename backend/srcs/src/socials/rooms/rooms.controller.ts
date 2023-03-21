import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  UseGuards,
  Param,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { RoomEntity } from './entities/room.entity';
import { AccessAuthGard } from 'src/auth/utils/guards';

@Controller('rooms')
@ApiTags('rooms')
@UseGuards(AccessAuthGard)
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post('/create')
  @ApiCreatedResponse({ type: RoomEntity })
  async create(@Request() req, @Body() createRoomDto: CreateRoomDto) {
    const creatorId = req.user.sub;
    createRoomDto.ownerId = creatorId;
    const room = await this.roomsService.create(createRoomDto);
    return this.roomsService.createRoomReturnEntity(room, undefined);
  }

  @Get('/history')
  @ApiCreatedResponse({ type: [RoomEntity] })
  async findHistory(@Request() req) {
    return await this.roomsService.findHistory(req.user.sub);
  }

  @Post('conv/history')
  async getHistoryRoom(@Request() req) {
    return await this.roomsService.findConvHistory(req.body.roomName);
  }

  @Post('/participants')
  async getParticipantsInRoom(@Request() req) {
    const test = await this.roomsService.getParticipantsInRoom(
      req.body.roomName,
    );
    return test;
  }

  @Post('/message')
  async newMessage(@Request() req, @Body() payload: any) {
    return await this.roomsService.newMessage(req.user.sub, payload);
  }

  @Post('/leave')
  async leaveRoom(@Request() req) {
    const room = await this.roomsService.leaveRoom(
      req.user.sub,
      req.body.roomId,
    );
  }
}
