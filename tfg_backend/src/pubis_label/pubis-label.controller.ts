import { Body, Controller, Get, NotFoundException, Param, Post} from '@nestjs/common';
import { PubisLabelService } from './pubis-label.service';
import { PubisLabel } from 'src/entities/pubis_label.entity';

@Controller('pubis-label')
export class PubisLabelController {
  constructor(private readonly pubisLabelService: PubisLabelService) {}

  @Get('training-history/:userId')
  async getTrainingHistory(@Param('userId') userId: string) {
    return this.pubisLabelService.getTrainingHistoryByUser(userId);
  }

  @Post('by-pubis-ids')
  getLabelsByPubisIds(@Body() pubisIdsDto: { pubisIds: string[]; userId?: string }): Promise<PubisLabel[]> {
    const { pubisIds, userId } = pubisIdsDto;
    return this.pubisLabelService.getPubisLabelsByPubisIds(pubisIds, userId);
  }


  
 
}
