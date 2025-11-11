import {
  Entity,
  Column,
  OneToMany,
  PrimaryGeneratedColumn,
  BeforeInsert,
} from 'typeorm';
import { generateShortId } from '../utils/generateShortId';
import { PubisLabel } from './pubis_label.entity';

@Entity()
export class Label {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 8, unique: true })
  shortId: string;

  @Column()
  auricular_face_ridges_and_grooves: string;

  @Column()
  auricular_face_irregular_pososity: string;

  @Column()
  upper_symphyseal_extremity_definition: string;

  @Column()
  upper_symphyseal_extremity_bony_nodule: string;

  @Column()
  lower_symphyseal_extremity_definition: string;

  @Column()
  dorsal_groove_definition: string;

  @Column()
  dorsal_groove_dorsal_plateau: string;

  @Column()
  ventral_margin_ventral_bevel: string;

  @Column()
  ventral_margin_ventral_margin: string;

  @Column()
  toddPhasePractitioner: string;

  @Column({ type: 'timestamp' })
  label_date: Date;
  @BeforeInsert()
  async generateShortId() {
    if (!this.shortId) {
      this.shortId = generateShortId(8);
    }
  }

  @OneToMany(() => PubisLabel, (pubisLabel) => pubisLabel.label)
  pubisLabels: PubisLabel[];
}
