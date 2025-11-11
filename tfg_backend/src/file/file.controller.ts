import { Body, Controller, Post } from '@nestjs/common';
import { FileService } from './file.service';
import { File } from 'src/entities/file.entity';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post()
  async create(@Body() fileData: Partial<File>): Promise<File> {
    return this.fileService.create(fileData);
  }
}
