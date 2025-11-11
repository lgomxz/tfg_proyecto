import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 200 })
  name: string;

  @Column('varchar', { length: 400 })
  description: string;

  @Column('date')
  date: string;

  @Column('int')
  order: number;

  @OneToMany(() => User, (user) => user.role)
  usuarios: User[];
}
