import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DigitalModel } from 'src/entities/model.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DigitalModelService {
  constructor(
    @InjectRepository(DigitalModel)
    private digitalModelRepository: Repository<DigitalModel>,
  ) {}

  // Método para crear un nuevo modelo digital
  create(digitalModelData: Partial<DigitalModel>): Promise<DigitalModel> {
    const digitalModel = this.digitalModelRepository.create(digitalModelData);
    return this.digitalModelRepository.save(digitalModel);
  }

  // Método para obtener todos los modelos digitales (2D o 3D) asociados a un pubis
  async findByPubis(pubisId: string): Promise<DigitalModel[]> {
    return this.digitalModelRepository.find({
      where: { pubis: { id: pubisId } },
      relations: ['files'],
    });
  }
}
