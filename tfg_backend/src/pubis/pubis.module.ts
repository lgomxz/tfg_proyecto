import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PubisController } from './pubis.controller';
import { PubisService } from './pubis.service';
import { Pubis } from 'src/entities/pubis.entity';
import { PubisLabel } from 'src/entities/pubis_label.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pubis, PubisLabel])],
  controllers: [PubisController],
  providers: [PubisService],
})
export class PubisModule {}
