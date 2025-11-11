import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
  Param,
  Res,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentationService } from './documentation.service';
import { Response } from 'express';
import * as path from 'path';

@Controller('documentation')
export class DocumentationController {
  constructor(private readonly documentationService: DocumentationService) {}

  @Get('download/:filename')
  async downloadFile(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    if (!filename.endsWith('.pdf')) {
      return res.status(400).send('File must be a PDF');
    }

    const filePath = path.join(process.cwd(), 'files', filename);

    return res.download(filePath, (err) => {
      if (err) {
        return res.status(404).send('File not found');
      }
    });
  }

  @Get('list')
  async listFiles() {
    return this.documentationService.listPdfFiles();
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.documentationService.uploadFile(file);
  }

  @Delete('delete/:filename')
  async deleteFile(@Param('filename') filename: string) {
    return this.documentationService.deleteFile(filename);
  }
}
