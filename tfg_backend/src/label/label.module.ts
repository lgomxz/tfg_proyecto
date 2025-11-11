import { Module } from '@nestjs/common';
import { LabelController } from './label.controller';
import { Label } from 'src/entities/label.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabelService } from './label.service';
import { PubisLabel } from 'src/entities/pubis_label.entity';
import { User } from 'src/entities/user.entity';
import { Pubis } from 'src/entities/pubis.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Label, PubisLabel, User, Pubis])],
  controllers: [LabelController],
  providers: [LabelService],
})
export class LabelModule {}
