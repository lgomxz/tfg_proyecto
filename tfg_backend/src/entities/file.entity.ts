import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { DigitalModel } from './model.entity';

@Entity()
export class File {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  link: string;

  @ManyToOne(() => DigitalModel, (digitalModel) => digitalModel.files)
  digitalModel: DigitalModel;
}
