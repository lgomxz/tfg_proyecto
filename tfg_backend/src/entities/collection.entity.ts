import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  BeforeInsert,
} from 'typeorm';
import { Pubis } from './pubis.entity';
import { generateShortId } from '../utils/generateShortId';
import { User } from './user.entity';

@Entity()
export class Collection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 8, unique: true })
  shortId: string;

  @Column('varchar', { length: 200 })
  name: string;

  @Column({ type: 'timestamp' })
  create_date: Date;
  @ManyToMany(() => Pubis, (pubis) => pubis.collections, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinTable({
    name: 'collection_pubis',
    joinColumn: {
      name: 'collection_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'pubis_id',
      referencedColumnName: 'id',
    },
  })
  pubis?: Pubis[];

  @ManyToMany(() => User, (user) => user.collections)
  users: User[];

  @BeforeInsert()
  async generateShortId() {
    if (!this.shortId) {
      this.shortId = generateShortId(8);
    }
  }
}
