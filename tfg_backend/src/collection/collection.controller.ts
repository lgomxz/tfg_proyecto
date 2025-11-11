import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CollectionService } from './collection.service';
import { Collection } from 'src/entities/collection.entity';
import { InsertResult } from 'typeorm';

@Controller('collections')
export class CollectionController {
  constructor(private collectionService: CollectionService) {}

  @Post('create')
  async createCollection(@Body() collection: Collection): Promise<Collection> {
    return await this.collectionService.create(collection);
  }

  @Get('getAll')
  async getAll(): Promise<Collection[]> {
    return await this.collectionService.getAll();
  }

  @Get('getById/:id')
  async getById(@Param('id') id: string): Promise<Collection> {
    return await this.collectionService.getById(id);
  }

  @Delete('delete/:id')
  async deleteCollection(@Param('id') id: string): Promise<void> {
    return await this.collectionService.delete(id);
  }

  @Put('edit')
  async editCollection(@Body() collection: Collection): Promise<Collection> {
    return await this.collectionService.edit(collection);
  }

  @Get('getName/:id')
  async getCollectionName(@Param('id') id: string): Promise<{ name: string }> {
    console.log('HOLO');
    return await this.collectionService.getName(id);
  }

  @Get('getByShortId/:shortId')
  async getCollectionByShortId(
    @Param('shortId') shortId: string,
  ): Promise<Collection> {
    const collection =
      await this.collectionService.getCollectionByShortId(shortId);

    if (!collection) {
      throw new NotFoundException(
        `No se encontró la colección con shortId ${shortId}`,
      );
    }

    return collection;
  }
}
