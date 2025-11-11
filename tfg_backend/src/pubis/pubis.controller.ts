import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { PubisService } from './pubis.service';
import { Pubis } from 'src/entities/pubis.entity';
import { File } from 'src/entities/file.entity';

@Controller('pubis')
export class PubisController {
  constructor(private readonly pubisService: PubisService) {}

  @Post()
  async create(@Body() pubisData: Partial<Pubis>): Promise<Pubis> {
    const createdPubis = await this.pubisService.create(pubisData);
    if (!createdPubis) {
      throw new Error('Error creating pubis');
    }
    return createdPubis;
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updates: Partial<Pubis>,
  ): Promise<void> {
    await this.pubisService.updatePubis(id, updates);
  }

  @Get('getAll')
  async getAllPubis(): Promise<Pubis[]> {
    return await this.pubisService.getAll();
  }

  @Get('getByCollection/:shortId')
  async getByCollection(@Param('shortId') shortId: string): Promise<Pubis[]> {
    return await this.pubisService.getByCollection(shortId);
  }

  @Get('getFiles/:id')
  async getFilesFromPubis(
    @Param('id') id: string,
  ): Promise<Record<string, File[]>> {
    return this.pubisService.getFilesByPubisId(id);
  }

  @Get('getByShortId/:shortId')
  async getCollectionByShortId(
    @Param('shortId') shortId: string,
  ): Promise<Pubis> {
    const collection = await this.pubisService.getPubisByShortId(shortId);

    if (!collection) {
      throw new NotFoundException(`Pubis with shortId: ${shortId} not found`);
    }

    return collection;
  }

  @Get('allLabeled')
  async getLabeledPubis(): Promise<Pubis[]> {
    return this.pubisService.getLabeledPubis();
  }

  @Get('labels/:pubisId')
  async getLabelsByPubisId(@Param('pubisId') pubisId: string) {
    const labels = await this.pubisService.getLabelsByPubisID(pubisId);

    if (!labels || labels.length === 0) {
      throw new NotFoundException(
        `No labels were found for the pubis with id ${pubisId}`,
      );
    }

    return labels;
  }

  @Get('random')
  async getRandomLabeledPubis(): Promise<Pubis> {
    return this.pubisService.getRandomLabeledPubis();
  }

  @Get('labelModes/:pubisId')
  async getLabelModes(
    @Param('pubisId') pubisId: string,
  ): Promise<Record<string, string[]>> {
    const modes = await this.pubisService.getPubisLabelModes(pubisId);

    if (!modes || Object.keys(modes).length === 0) {
      throw new NotFoundException(
        `No se encontraron labels para el pubis con id ${pubisId}`,
      );
    }

    return modes;
  }
  @Get(':pubisShortId/subject-short-id')
  async getSubjectShortId(
    @Param('pubisShortId') pubisShortId: string,
  ): Promise<{ subjectShortId: string }> {
    const subjectShortId =
      await this.pubisService.getSubjectShortIdByPubisShortId(pubisShortId);
    if (!subjectShortId) {
      throw new NotFoundException(
        `No se encontró subjectShortId para pubisShortId ${pubisShortId}`,
      );
    }
    return { subjectShortId };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePubis(@Param('id') id: string) {
    await this.pubisService.deletePubis(id);
    return; // 204 No Content
  }
}
