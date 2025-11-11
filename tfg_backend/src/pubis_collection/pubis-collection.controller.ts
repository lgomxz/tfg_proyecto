import { Body, Controller, Post } from '@nestjs/common';
import { CollectionPubisService } from './pubis-collection.service';
import { CollectionPubis } from 'src/entities/collection_pubis.entity';
import { CreateCollectionPubisDto } from 'src/DTO/CreateCollectionPubisDTO.dto';

@Controller('collection-pubis')
export class CollectionPubisController {
  constructor(
    private readonly collectionPubisService: CollectionPubisService,
  ) {}

  @Post('create')
  async create(
    @Body() data: CreateCollectionPubisDto,
  ): Promise<CollectionPubis> {
    const { collectionId, pubisId } = data;
    const createdPubisCollection =
      await this.collectionPubisService.createRelation(collectionId, pubisId);
    if (!createdPubisCollection) {
      throw new Error('Error creating relation: undefined');
    }
    return createdPubisCollection;
  }
}
