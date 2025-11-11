import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { LabelService } from './label.service';
import { Label } from 'src/entities/label.entity';
import { CreateLabelDto } from 'src/DTO/CreateLabelDTO.dto';

@Controller('label')
export class LabelController {
  constructor(private readonly labelService: LabelService) {}

  @Post('create')
  async createLabel(@Body() body: CreateLabelDto): Promise<Label> {
    const { userId, pubisId, isTraining, score, ...labelData } = body;
    return await this.labelService.create(
      labelData,
      userId,
      pubisId,
      score,
      isTraining,
    );
  }

  @Get('getLabels/:id')
  async getLabelById(@Param('id') id: string): Promise<Label> {
    return await this.labelService.getLabelById(id);
  }

  @Get('getShortLabels/:shortId')
  async getLabelByShortId(@Param('shortId') shortId: string): Promise<Label> {
    return await this.labelService.getLabelById(shortId);
  }

  @Post('createARFF')
  async createFileARFF(@Body('id') id: string | string[]) {
    const prediction = await this.labelService.createARFF(id);
    return { prediction };
  }

  @Post('estimateAge')
  async estimateAge(@Body('id') id: string | string[]) {
    console.log('llega');
    const results = await this.labelService.estimateAgeFromPubisIds(id);
    return { results };
  }
}
