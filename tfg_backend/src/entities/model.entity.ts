import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Pubis } from './pubis.entity';
import { File } from './file.entity';

@Entity()
export class DigitalModel {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  model_type: string; // Puede ser '2D' o '3D'

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  acquisition_date: Date;

  @ManyToOne(() => Pubis, (pubis) => pubis.digitalModels)
  pubis: Pubis;

  @OneToMany(() => File, (file) => file.digitalModel)
  files: File[];
}
