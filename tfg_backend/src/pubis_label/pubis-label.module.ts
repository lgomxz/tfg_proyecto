import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PubisLabelService } from './pubis-label.service';
import { PubisLabelController } from './pubis-label.controller';
import { PubisLabel } from 'src/entities/pubis_label.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PubisLabel])],
  controllers: [PubisLabelController],
  providers: [PubisLabelService],
  exports: [PubisLabelService],
})
export class PubisLabelModule {}
