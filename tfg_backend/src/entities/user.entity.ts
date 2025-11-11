import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Role } from './role.entity';
import { Experiment } from './experiment.entity';
import { PubisLabel } from './pubis_label.entity';
import { Collection } from './collection.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 200 })
  name: string;

  @Column('varchar', { length: 200 })
  lastname: string;

  @Column('varchar', { length: 200 })
  email: string;

  @Column('varchar', { length: 200 })
  password: string;

  @Column('varchar', { length: 200 })
  status: string;

  @Column('varchar', { length: 500 })
  description: string;

  @CreateDateColumn({ type: 'timestamp' })
  creation_date: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  update_date: Date;

  @ManyToOne(() => Role, (role) => role.id, { nullable: true })
  role: Role;

  @Column('varchar', { length: 500, nullable: true })
  photoUrl: string;

  @OneToMany(() => Experiment, (experiment) => experiment.user)
  experiments: Experiment[];

  // Campo para almacenar el token de restablecimiento de contraseña
  @Column({ type: 'varchar', length: 200, nullable: true })
  resetPasswordToken: string;

  // Fecha de expiración del token
  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpires: Date;

  @OneToMany(() => PubisLabel, (pubisLabel) => pubisLabel.user)
  pubisLabels: PubisLabel[];

  @ManyToMany(() => Collection, (collection) => collection.users)
  @JoinTable({
    name: 'user_collections',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'collection_id',
      referencedColumnName: 'id',
    },
  })
  collections: Collection[];
}
