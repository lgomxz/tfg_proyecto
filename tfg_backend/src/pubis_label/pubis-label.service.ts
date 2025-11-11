import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PubisLabel } from 'src/entities/pubis_label.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PubisLabelService {
  constructor(
    @InjectRepository(PubisLabel)
    private pubisLabelRepository: Repository<PubisLabel>,
  ) {}

  // Se obtiene el historial de entrenamiento de un usuario en específico
  async getTrainingHistoryByUser(userId: string) {
    const rawHistory = await this.pubisLabelRepository.find({
      where: {
        user: { id: userId },
        isTraining: true,
      },
      order: { createdAt: 'ASC' },
    });

    // Transformamos los datos para devolver solo la información relevante
    return rawHistory.map((entry) => ({
      score: entry.score,
      createdAt: entry.createdAt,
      labelName: entry.label ?? null,
    }));
  }

  // Se obtienen las etiquetas de los pubis etiquetados por un usuario
  async getPubisLabelsByPubisIds(
    pubisIds: string[],
    userId: string,
  ): Promise<PubisLabel[]> {
    if (!pubisIds.length) {
      return [];
    }

    const query = this.pubisLabelRepository
      .createQueryBuilder('pubisLabel')
      .leftJoinAndSelect('pubisLabel.label', 'label')
      .addSelect('label.shortId')
      .leftJoinAndSelect('pubisLabel.pubis', 'pubis')
      .leftJoinAndSelect('pubis.subject', 'subject')
      .leftJoin('pubisLabel.user', 'user')
      .addSelect(['user.name', 'user.lastname', 'user.id'])
      .where('pubisLabel.pubis IN (:...pubisIds)', { pubisIds })
      .andWhere('pubisLabel.isTraining = 0');

    if (userId) {
      query.andWhere('pubisLabel.userId = :userId', { userId });
    }

    // Excluir campos con valor string 'null'
    query
      .andWhere('label.auricular_face_ridges_and_grooves != :nullValue', {
        nullValue: 'null',
      })
      .andWhere('label.auricular_face_irregular_pososity != :nullValue', {
        nullValue: 'null',
      })
      .andWhere('label.upper_symphyseal_extremity_definition != :nullValue', {
        nullValue: 'null',
      })
      .andWhere('label.upper_symphyseal_extremity_bony_nodule != :nullValue', {
        nullValue: 'null',
      })
      .andWhere('label.lower_symphyseal_extremity_definition != :nullValue', {
        nullValue: 'null',
      })
      .andWhere('label.dorsal_groove_definition != :nullValue', {
        nullValue: 'null',
      })
      .andWhere('label.dorsal_groove_dorsal_plateau != :nullValue', {
        nullValue: 'null',
      })
      .andWhere('label.ventral_margin_ventral_bevel != :nullValue', {
        nullValue: 'null',
      })
      .andWhere('label.ventral_margin_ventral_margin != :nullValue', {
        nullValue: 'null',
      })
      .andWhere('label.toddPhasePractitioner != :nullValue', {
        nullValue: 'null',
      });

    return query.getMany();
  }
}
