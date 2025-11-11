import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Subject } from 'src/entities/subject.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SubjectService {
  constructor(
    @InjectRepository(Subject)
    private subjectRepository: Repository<Subject>,
  ) {}

  // Método para verificar si un sujeto ya existe por ID
  async exists(id: string): Promise<boolean> {
    const subject = await this.subjectRepository.findOne({ where: { id } });
    return !!subject;
  }

  // Método para crear un sujeto
  async create(subjectData: Partial<Subject>): Promise<Subject> {
    const subject = this.subjectRepository.create(subjectData);
    return this.subjectRepository.save(subject);
  }

  // Método para actualizar los datos de un sujeto
  async updateSubject(subjectId: string, updatedData: Partial<Subject>) {
    return this.subjectRepository.update(subjectId, updatedData);
  }

  // Método que devuelve la edad biológica de muerte de un suujeto dado su shortId
  async getBiologicalAgeAtDeathByShortId(
    shortId: string,
  ): Promise<number | null> {
    const subject = await this.subjectRepository.findOne({
      where: { shortId },
    });
    if (!subject) {
      return null;
    }
    return subject.biological_age_at_death ?? null;
  }
}
