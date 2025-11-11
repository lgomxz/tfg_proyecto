import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  Body,
  Response,
  Param,
  NotFoundException,
  Delete,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response as ExpressResponse } from 'express';
import { FileService } from 'src/file/file.service';

@Controller('upload')
export class UploadController {
  constructor(
    private uploadService: UploadService,
    private fileService: FileService,
  ) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  async upload(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('is3D') is3D: string,
    @Body('relativePaths') relativePaths: string[],
    @Body('createdSubjectId') createdSubjectId: string,
    @Response() res: ExpressResponse,
  ): Promise<ExpressResponse> {
    try {
      if (!files || files.length === 0) {
        return res.status(400).json({ message: 'No files were received.' });
      }
      // Convertimos is3D en booleano (por seguridad)
      const is3DFlag = is3D === 'true';

      // Subimos los archivos y obtenemos los enlaces de acceso
      const downloadUrls = await this.uploadService.uploadFiles(
        files,
        is3DFlag,
        relativePaths, // Se pasan las rutas relativas al servicio
        createdSubjectId,
      );

      return res.status(200).json({
        message: 'Files uploaded succesfully',
        urls: downloadUrls,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: 'Error uoloading files', error: error.message });
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    const file = await this.fileService.getById(id);
    if (!file) throw new NotFoundException('File not found');

    await this.uploadService.deleteFile(file.link);

    await this.fileService.deleteFile(id);
  }
}
