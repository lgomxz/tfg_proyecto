import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { Collection } from 'src/entities/collection.entity';

@Injectable()
export class UserCollectionsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  //Obtiene todas las colecciones asignadas a un usuario
  async getCollectionsByUserId(userId: string): Promise<Collection[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['collections'],
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user.collections || [];
  }

  // Asigna una o varias colecciones a uno o varios usuarios.
  async assignCollectionsToUsers(
    userIds: string | string[],
    collectionIds: string | string[],
  ): Promise<void> {
    // Normaliza los parámetros a arrays para simplificar la lógica
    const userIdList = Array.isArray(userIds) ? userIds : [userIds];
    const collectionIdList = Array.isArray(collectionIds)
      ? collectionIds
      : [collectionIds];

    // Busca todos los usuarios por su ID, incluyendo sus colecciones actuales
    const users = await this.userRepository.find({
      where: { id: In(userIdList) },
      relations: ['collections'],
    });

    if (users.length === 0) {
      throw new Error('Ningún usuario encontrado');
    }

    // Crea instancias temporales de Collection solo con su ID
    const collectionsToAdd = collectionIdList.map((id) => {
      const collection = new Collection();
      collection.id = id;
      return collection;
    });

    // Para cada usuario, añade solo colecciones no asignadas todavía
    for (const user of users) {
      const newCollections = collectionsToAdd.filter(
        (c) => !user.collections.some((uc) => uc.id === c.id),
      );
      user.collections.push(...newCollections);
    }

    await this.userRepository.save(users);
  }
}
