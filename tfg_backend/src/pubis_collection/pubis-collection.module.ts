import { Module } from '@nestjs/common';
import { CollectionPubisService } from './pubis-collection.service';
import { CollectionPubisController } from './pubis-collection.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectionPubis } from 'src/entities/collection_pubis.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CollectionPubis]),
  ],
  providers: [CollectionPubisService],
  controllers: [CollectionPubisController],
  exports: [CollectionPubisService],
})
export class CollectionPubisModule {}
