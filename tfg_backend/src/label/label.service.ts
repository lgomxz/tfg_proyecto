import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Label } from 'src/entities/label.entity';
import { Pubis } from 'src/entities/pubis.entity';
import { PubisLabel } from 'src/entities/pubis_label.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import {
  generateArffPrediction,
  estimateAgeFromLabel,
} from '../utils/scriptUtils';

@Injectable()
export class LabelService {
  constructor(
    @InjectRepository(Label) private labelRepository: Repository<Label>,
    @InjectRepository(PubisLabel)
    private pubisLabelRepository: Repository<PubisLabel>,
    @InjectRepository(Pubis) private pubisRepository: Repository<Pubis>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  // Crea una etiquetado nuevo y la asocia a un Pubis y un Usuario
  async create(
    label: Partial<Label>,
    userId: string,
    pubisId: string,
    score: number,
    isTraining: boolean,
  ) {
    const newLabel = this.labelRepository.create({
      ...label,
      label_date: new Date(),
    });

    const savedLabel = await this.labelRepository.save(newLabel);

    const pubis = await this.pubisRepository.findOne({
      where: { id: pubisId },
    });
    const user = await this.userRepository.findOne({ where: { id: userId } });

    const pubisLabel = this.pubisLabelRepository.create({
      pubis,
      user,
      label: savedLabel,
      score: score,
      isTraining: isTraining,
    });

    await this.pubisLabelRepository.save(pubisLabel);

    return savedLabel;
  }

  // Se obtiene un etiquetado en base a su id
  async getLabelById(id: string): Promise<Label> {
    return await this.labelRepository.findOneBy({ id });
  }

  async getLabelByShortId(shortId: string): Promise<Label> {
    console.log(await this.labelRepository.findOneBy({ shortId }));
    return await this.labelRepository.findOneBy({ shortId });
  }

  // Genera predicciones/estimaciones para uno o varios etiquetados (estimación por fases)
  async createARFF(
    idOrIds: string | string[],
  ): Promise<{ labelId: string; prediction: string | null }[]> {
    const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];

    // Se buscan los etiquetados en base de datos
    const labels = await this.labelRepository.findByIds(ids);

    if (!labels.length) throw new Error('Labels not found');

    // Se construye un map para que el acceso sea rápido
    const labelMap = new Map(labels.map((label) => [label.id, label]));

    // Asegura orden y que no haya undefined
    const labelsOrdered = ids.map((id) => {
      const label = labelMap.get(id);
      if (!label) throw new Error(`Label with id: ${id} not found`);
      return label;
    });

    // Se preparan los datos para la estimación
    const formattedData = labelsOrdered.map((label) => ({
      ArticularFace: label.auricular_face_ridges_and_grooves,
      IrregularPorosity: label.auricular_face_irregular_pososity,
      UpperSymphysialExtremity: label.upper_symphyseal_extremity_definition,
      BonyNodule: label.upper_symphyseal_extremity_bony_nodule,
      LowerSymphysialExtremity: label.lower_symphyseal_extremity_definition,
      DorsalMargin: label.dorsal_groove_definition,
      DorsalPlateau: label.dorsal_groove_dorsal_plateau,
      VentralBevel: label.ventral_margin_ventral_bevel,
      VentralMargin: label.ventral_margin_ventral_margin,
      ToddPhase: label.toddPhasePractitioner,
    }));

    // Se generan las predicciones
    const predictions = await generateArffPrediction(formattedData);

    // Asegura mapeo correcto por posición
    const result = labelsOrdered.map((label, i) => ({
      labelId: label.shortId,
      prediction: predictions[i] || null,
    }));

    return result;
  }


// Estima la edad numérica de uno o varios pubis etiquetados
  async estimateAgeFromPubisIds(
    idOrIds: string | string[],
  ): Promise<{ labelId: string; age: number | null }[]> {
    const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];

    const labels = await this.labelRepository.findByIds(ids);

    if (!labels.length) throw new Error('No se encontraron labels');

    const labelMap = new Map(labels.map((label) => [label.id, label]));

    // Se ordenan según los IDs originales 
    const labelsOrdered = ids.map((id) => {
      const label = labelMap.get(id);
      if (!label) throw new Error(`No se encontró el label con id: ${id}`);
      return label;
    });

    // Se estima la edad para cada label
    const results = labelsOrdered.map((label) => ({
      labelId: label.shortId,
      age: estimateAgeFromLabel(label),
    }));
    return results;
  }
}
