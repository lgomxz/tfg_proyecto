import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Collection } from 'src/entities/collection.entity';
import { UserCollectionsService } from './user_collections.service';
import { UserCollectionsController } from './user_collections.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Collection])],
  controllers: [UserCollectionsController], 
  providers: [UserCollectionsService],
  exports: [UserCollectionsService],
})
export class UserCollectionModule {}
