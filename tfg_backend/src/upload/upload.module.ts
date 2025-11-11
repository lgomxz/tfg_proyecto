import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { FileModule } from 'src/file/file.module';

@Module({
  controllers: [UploadController],
  providers: [UploadService],
  imports: [FileModule],
})
export class UploadModule {}
