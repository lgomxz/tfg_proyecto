import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  OneToMany,
  ManyToOne,
  BeforeInsert,
  JoinColumn,
} from 'typeorm';
import { Subject } from './subject.entity';
import { Experiment } from './experiment.entity';
import { Collection } from './collection.entity';
import { DigitalModel } from './model.entity';
import {generateShortId} from '../utils/generateShortId';
import { PubisLabel } from './pubis_label.entity';

@Entity()
export class Pubis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 8, unique: true })
  shortId: string;

  @Column('varchar', { length: 200 })
  laterality: string;

  @Column('varchar', { length: 200 })
  preservation_state: string;

  @ManyToOne(() => Subject, (subject) => subject.pubis, { eager: true })
  @JoinColumn({ name: 'subjectShortId', referencedColumnName: 'shortId' })
  subject: Subject;

  @OneToMany(() => Experiment, (experiment) => experiment.pubis)
  experiments: Experiment[];

  @ManyToMany(() => Collection, (collection) => collection.pubis, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  collections?: Collection[];

  @OneToMany(() => DigitalModel, (digitalModel) => digitalModel.pubis)
  digitalModels: DigitalModel[];

  @BeforeInsert()
  async generateShortId() {
    if (!this.shortId) {
      this.shortId = generateShortId(8);
    }
  }
  
  @OneToMany(() => PubisLabel, (pubisLabel) => pubisLabel.pubis)
  pubisLabels: PubisLabel[];

}
