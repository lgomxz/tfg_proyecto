import { Entity, Column, OneToMany, PrimaryGeneratedColumn, BeforeInsert } from 'typeorm';
import { Pubis } from './pubis.entity';

import {generateShortId} from '../utils/generateShortId';

@Entity()
export class Subject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 8, unique: true })
  shortId: string;

  @Column()
  name: string;

  @Column()
  lastname: string;

  @Column()
  sex: string;

  @Column()
  biological_age_at_death: number;

  @Column()
  preliminary_proceedings: string;

  @Column()
  toxicological_report: string;

  @Column()
  death_cause: string;

  @Column()
  body_build: string;

  @Column()
  judged: string;

  @Column({ type: 'timestamp' })
  acquisition_year: string;

  @OneToMany(() => Pubis, (pubis) => pubis.subject)
  pubis: Pubis[];

  @BeforeInsert()
  async generateShortId() {
    if (!this.shortId) {
      this.shortId = generateShortId(8);
    }
  }
}
