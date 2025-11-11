import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Collection } from 'src/entities/collection.entity';
import { CollectionPubis } from 'src/entities/collection_pubis.entity';
import { Pubis } from 'src/entities/pubis.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CollectionPubisService {
  constructor(
    @InjectRepository(CollectionPubis)
    private collectionPubisRepository: Repository<CollectionPubis>,
  ) {}

  // Crea una relación entre pubis y colección
  createRelation(
    collectionId: string,
    pubisId: string,
  ): Promise<CollectionPubis> {
    const relation = new CollectionPubis();

    const collection = new Collection();
    collection.id = collectionId;

    const pubis = new Pubis();
    pubis.id = pubisId;

    relation.collection = collection;
    relation.pubis = pubis;

    return this.collectionPubisRepository.save(relation);
  }
}
