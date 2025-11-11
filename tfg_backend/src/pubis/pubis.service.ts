import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { File } from 'src/entities/file.entity';
import { Label } from 'src/entities/label.entity';
import { Pubis } from 'src/entities/pubis.entity';
import { PubisLabel } from 'src/entities/pubis_label.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PubisService {
  constructor(
    @InjectRepository(Pubis)
    private pubisRepository: Repository<Pubis>,
    @InjectRepository(PubisLabel)
    private pubisLabelRepository: Repository<PubisLabel>,
  ) {}

  // Método para crear un nuevo pubis
  async create(pubisData: Partial<Pubis>): Promise<Pubis> {
    const pubis = this.pubisRepository.create(pubisData);
    return await this.pubisRepository.save(pubis);
  }

  // Mñetodo para actualizar un pubis
  async updatePubis(id: string, updates: Partial<Pubis>): Promise<void> {
    await this.pubisRepository.update(id, updates);
  }

  // Devuelve todos los pubis de la bbdd
  async getAll(): Promise<Pubis[]> {
    return await this.pubisRepository
      .createQueryBuilder('pubis')
      .leftJoin('pubis.subject', 'subject')
      .select(['pubis', 'subject.shortId'])
      .getMany();
  }

  // Obtiene los pubis asociados a una colección específica
  async getByCollection(collectionId: string): Promise<Pubis[]> {
    const pubis = await this.pubisRepository
      .createQueryBuilder('pubis')
      .innerJoin('pubis.collections', 'collection')
      .where('collection.shortId = :collectionId', { collectionId })
      .leftJoinAndSelect('pubis.subject', 'subject')
      .getMany();
    return pubis;
  }

  // Obtiene un pubis en base a su shortId
  async getPubisByShortId(shortId: string): Promise<Pubis> {
    return await this.pubisRepository.findOneBy({ shortId });
  }

  // Obtiene todos los archivos asociados a un pubis y organizados por tipo de modelo digital
  async getFilesByPubisId(pubisId: string): Promise<Record<string, File[]>> {
    const pubis = await this.pubisRepository.findOne({
      where: { id: pubisId },
      relations: ['digitalModels', 'digitalModels.files'],
    });

    if (!pubis) {
      throw new Error(`No se encontró el pubis con id ${pubisId}`);
    }

    // Crea un objeto para clasificar los archivos por model_type
    const filesByModelType: Record<string, File[]> = {};

    // Itera sobre los modelos y clasifica los archivos por model_type
    pubis.digitalModels.forEach((model) => {
      model.files.forEach((file) => {
        if (!filesByModelType[model.model_type]) {
          filesByModelType[model.model_type] = [];
        }
        filesByModelType[model.model_type].push(file);
      });
    });

    return filesByModelType;
  }

  // Obtiene los pubis que están etiquetados por expertos/administradores
  async getLabeledPubis(): Promise<Pubis[]> {
    const labeledPubisLabels = await this.pubisLabelRepository
      .createQueryBuilder('label')
      .leftJoinAndSelect('label.pubis', 'pubis')
      .leftJoinAndSelect('label.user', 'user')
      .leftJoin('user.role', 'role') // Join explícito con tabla de roles
      .where('role.name IN (:...roles)', { roles: ['admin', 'experto'] })
      .getMany();

    const pubisMap = new Map<string, Pubis>();
    for (const label of labeledPubisLabels) {
      pubisMap.set(label.pubis.id, label.pubis);
    }

    return Array.from(pubisMap.values());
  }

  // Obtiene etiquetas de un pubis específico
  async getLabelsByPubisID(id: string): Promise<PubisLabel[]> {
    return await this.pubisLabelRepository.find({
      where: { pubis: { id } },
      relations: ['user', 'user.role', 'pubis'],
    });
  }

  // Zona training
  // Obtiene un pubis aleatorio etiquetado
  async getRandomLabeledPubis(): Promise<Pubis> {
    const pubisArray = await this.getLabeledPubis();

    if (pubisArray.length === 0) {
      throw new Error(
        'No hay pubis etiquetados por usuarios expertos o admin.',
      );
    }

    const randomIndex = Math.floor(Math.random() * pubisArray.length);
    return pubisArray[randomIndex];
  }

  // Obtiene la moda (valor más frecuetne) de las variables de un pubis etiquetado
  async getPubisLabelModes(pubisId: string): Promise<Record<string, string[]>> {
    const expertLabels = await this.pubisLabelRepository
      .createQueryBuilder('pl')
      .leftJoinAndSelect('pl.label', 'label')
      .leftJoinAndSelect('pl.user', 'user')
      .leftJoinAndSelect('user.role', 'role')
      .where('pl.pubis.id = :pubisId', { pubisId })
      .andWhere('role.name IN (:...roles)', { roles: ['admin', 'experto'] })
      .andWhere('pl.isTraining = false')
      .getMany();

    if (!expertLabels.length) {
      return {};
    }

    const labelFields: (keyof Omit<Label, 'label_date' | 'pubisLabels'>)[] = [
      'auricular_face_ridges_and_grooves',
      'auricular_face_irregular_pososity',
      'upper_symphyseal_extremity_definition',
      'upper_symphyseal_extremity_bony_nodule',
      'lower_symphyseal_extremity_definition',
      'dorsal_groove_definition',
      'dorsal_groove_dorsal_plateau',
      'ventral_margin_ventral_bevel',
      'ventral_margin_ventral_margin',
    ];

    const modes: Record<string, string[]> = {};

    // Calcula la moda
    for (const field of labelFields) {
      const frequencyMap: Record<string, number> = {};

      for (const pl of expertLabels) {
        const value = pl.label[field] as string;
        if (!value) continue;

        const key = String(value);
        frequencyMap[key] = (frequencyMap[key] || 0) + 1;
      }

      const maxFrequency = Math.max(...Object.values(frequencyMap));

      const modeValues = Object.entries(frequencyMap)
        .filter(([_, freq]) => freq === maxFrequency)
        .map(([val]) => val);

      modes[field] = modeValues;
    }
    return modes;
  }

  // Devuelve el shortId de un sujeto asociado a un pubis
  async getSubjectShortIdByPubisShortId(
    pubisShortId: string,
  ): Promise<string | null> {
    const pubis = await this.pubisRepository.findOne({
      where: { shortId: pubisShortId },
      relations: ['subject'],
    });

    if (!pubis || !pubis.subject) {
      return null;
    }

    return pubis.subject.shortId;
  }

  // Elimina un pubis y todas sus relaciones
  async deletePubis(pubisId: string): Promise<void> {
    const pubis = await this.pubisRepository.findOne({
      where: { id: pubisId },
      relations: ['digitalModels', 'digitalModels.files', 'pubisLabels'],
    });

    if (!pubis) {
      throw new NotFoundException(`Pubis con id ${pubisId} no encontrado`);
    }

    if (pubis.pubisLabels && pubis.pubisLabels.length > 0) {
      await this.pubisLabelRepository.remove(pubis.pubisLabels);
    }

    if (pubis.digitalModels && pubis.digitalModels.length > 0) {
      for (const model of pubis.digitalModels) {
        if (model.files && model.files.length > 0) {
          const fileRepo = this.pubisRepository.manager.getRepository(File);
          await fileRepo.remove(model.files);
        }
      }
      await this.pubisRepository.manager
        .getRepository('DigitalModel')
        .remove(pubis.digitalModels);
    }

    await this.pubisRepository.remove(pubis);
  }
}
