import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { DigitalModelService } from './digital-model.service';
import { DigitalModel } from 'src/entities/model.entity';

@Controller('digital-model')
export class DigitalModelController {
  constructor(private readonly digitalModelService: DigitalModelService) {}

  @Post()
  async create(
    @Body() digitalModelData: Partial<DigitalModel>,
  ): Promise<DigitalModel> {
    return this.digitalModelService.create(digitalModelData);
  }

  @Get('pubis/:pubisId')
  findByPubis(@Param('pubisId') pubisId: string) {
    return this.digitalModelService.findByPubis(pubisId);
  }
}
