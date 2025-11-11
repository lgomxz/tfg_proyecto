import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/entities/role.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  // Método para obtener todos los roles
  async getAll(): Promise<Role[]> {
    return this.rolesRepository.find(); // Devuelve todos los roles
  }

  // Método para obtener un rol por id
  async getRoleById(id: string): Promise<Role> {
    const role = await this.rolesRepository.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }

  // Devuelve el nombre de un rol
  async getRoleName(id: string): Promise<string> {
    const role = await this.rolesRepository.findOne({ where: { id } });
    return role.name;
  }
}
