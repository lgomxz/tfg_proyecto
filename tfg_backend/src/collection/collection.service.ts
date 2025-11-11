import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Collection } from 'src/entities/collection.entity';
import { InsertResult, Repository } from 'typeorm';

@Injectable()
export class CollectionService {
  constructor(
    @InjectRepository(Collection)
    private collectionsRepository: Repository<Collection>,
  ) {}

  // Método para crear una nueva colección
  async create(collection: Collection): Promise<Collection> {
    const newCollection = new Collection();

    newCollection.name = collection.name;
    newCollection.create_date = new Date();

    const col = await this.collectionsRepository.save(newCollection);

    return col;
  }

  // Método para obtener todas las colecciones
  async getAll(): Promise<Collection[]> {
    return this.collectionsRepository.find();
  }

  // Método para obtener una colección por su ID
  async getById(id: string): Promise<Collection> {
    return this.collectionsRepository.findOneBy({ id: id });
  }

  // Método para borrar una colección
  async delete(id: string): Promise<void> {
    await this.collectionsRepository.delete(id);
  }

  // Método para editar una colección

  async edit(collection: Collection): Promise<Collection> {
    await this.collectionsRepository.update(collection.id, collection);
    return this.getById(collection.id); // Devuelve la colección actualizada
  }

  // Método que obtiene el nombre de una colección dado su shortId
  async getName(id: string): Promise<{ name: string }> {
    const collection = await this.collectionsRepository.findOneBy({
      shortId: id,
    });
    console.log(id);
    // Verificamos si la colección existe y si tiene el campo 'name'
    if (collection && collection.name) {
      return { name: collection.name };
    } else {
      throw new Error('Colección no encontrada o nombre no disponible');
    }
  }

  // Método que obtiene la colección completa dado du shortId
  async getCollectionByShortId(shortId: string): Promise<Collection | null> {
    return this.collectionsRepository.findOneBy({ shortId });
  }
}
