import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  NotFoundException,
  Put,
} from '@nestjs/common';
import { SubjectService } from './subject.service';
import { Subject } from 'src/entities/subject.entity';

@Controller('subject')
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  @Get(':id/exists')
  async checkIfExists(@Param('id') id: string): Promise<{ exists: boolean }> {
    const exists = await this.subjectService.exists(id);
    return { exists };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updates: Partial<Subject>,
  ): Promise<void> {
    await this.subjectService.updateSubject(id, updates);
  }

  @Post()
  async create(@Body() subjectData: Partial<Subject>): Promise<Subject> {
    return this.subjectService.create(subjectData);
  }

  @Get('age-at-death/:shortId')
  async getAgeAtDeath(
    @Param('shortId') shortId: string,
  ): Promise<{ biological_age_at_death: number }> {
    const age =
      await this.subjectService.getBiologicalAgeAtDeathByShortId(shortId);
    if (age === null) {
      throw new NotFoundException(
        `Subject with shortId ${shortId} not found or age not defined`,
      );
    }
    return { biological_age_at_death: age };
  }
}
