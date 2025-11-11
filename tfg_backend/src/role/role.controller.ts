import { Controller, Get, Param } from '@nestjs/common';
import { Role } from 'src/entities/role.entity';
import { RoleService } from './role.service';

@Controller('roles')
export class RoleController {
  constructor(private roleService: RoleService) {}

  @Get('getAll')
  async getAll(): Promise<Role[]> {
    return await this.roleService.getAll();
  }

  @Get(':id')
  async getRoleById(@Param('id') id: string): Promise<Role> {
    return await this.roleService.getRoleById(id);
  }

  @Get('name/:id')
  async getRoleName(@Param('id') id: string): Promise<{ name: string }> {
    const name = await this.roleService.getRoleName(id);
    return { name };
  }
}
