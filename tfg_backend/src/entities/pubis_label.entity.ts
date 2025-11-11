import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { Pubis } from './pubis.entity';
import { Label } from './label.entity';
import { User } from './user.entity';

@Entity()
export class PubisLabel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Pubis, (pubis) => pubis.pubisLabels, {
    eager: true,
    onDelete: 'CASCADE',
  })
  pubis: Pubis;

  @ManyToOne(() => Label, { eager: true, cascade: true })
  label: Label;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  user: User;

  @Column({ default: false })
  isTraining: boolean;

  @Column({ type: 'float', nullable: true })
  score?: number;

  @CreateDateColumn()
  createdAt: Date;
}
