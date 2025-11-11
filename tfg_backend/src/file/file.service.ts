import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { File } from 'src/entities/file.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
  ) {}

  // Crea un archivo nuevo en bbdd
  async create(fileData: Partial<File>): Promise<File> {
    const file = this.fileRepository.create(fileData);
    return this.fileRepository.save(file);
  }

  // Devuelve un archivo en base a su id
  async getById(id: string): Promise<File> {
    const file = await this.fileRepository.findOne({ where: { id } });
    if (!file) throw new NotFoundException(`File with ID ${id} not found`);
    return file;
  }

  // Borra un archivo de bbdd en base a su id
  async deleteFile(id: string): Promise<void> {
    const result = await this.fileRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }
  }
}
