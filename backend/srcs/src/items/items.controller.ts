import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ItemEntity } from './entities/item.entity';
import { AccessAuthGard } from 'src/auth/utils/guards';

@Controller('items')
@UseGuards(AccessAuthGard)
@ApiTags('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  @ApiOkResponse({ type: ItemEntity, isArray: true })
  findAll(@Request() req) {
    return this.itemsService.findAll(req.user.sub);
  }

  @Post("/buy")
  buyItem(@Request() req) {
    return this.itemsService.buyItem(req.user.sub, req.body.name);
  }

  @Get("/user-items")
  getUserItem(@Request() req) {
    return this.itemsService.getUserItem(req.user.sub);
  }

  @Post("has-item")
  hasItem(@Request() req) {
    return this.itemsService.hasItem(req.user.sub, req.body.name);
  }
}
