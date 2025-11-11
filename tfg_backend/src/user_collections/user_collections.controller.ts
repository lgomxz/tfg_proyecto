import {
  Controller,
  Get,
  Post,
  Param,
  HttpException,
  HttpStatus,
  Body,
} from '@nestjs/common';
import { Collection } from 'src/entities/collection.entity';
import { UserCollectionsService } from './user_collections.service';
import { User } from 'src/entities/user.entity';

class AssignCollectionsDto {
  userIds: string[]; // uno o varios ids de usuario
  collectionIds: string[]; // uno o varios ids de colección
}

@Controller('user-collections')
export class UserCollectionsController {
  constructor(
    private readonly userCollectionsService: UserCollectionsService,
  ) {}

  @Get(':userId/collections')
  async getCollectionsByUserId(
    @Param('userId') userId: string,
  ): Promise<Collection[]> {
    try {
      return await this.userCollectionsService.getCollectionsByUserId(userId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Post('assign-collections')
  async assignCollectionsToUsers(
    @Body() body: AssignCollectionsDto,
  ): Promise<{ message: string }> {
    const { userIds, collectionIds } = body;

    if (!userIds || userIds.length === 0) {
      throw new HttpException(
        'You must provide at least one userId',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!collectionIds || collectionIds.length === 0) {
      throw new HttpException(
        'You must provide at least one collectionId',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      await this.userCollectionsService.assignCollectionsToUsers(
        userIds,
        collectionIds,
      );
      return { message: 'Collections successfully assigned to users' };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error assigning collections',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
