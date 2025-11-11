import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Pubis } from './pubis.entity';
import { Collection } from './collection.entity';

@Entity('collection_pubis')
export class CollectionPubis {
  @PrimaryColumn({ name: 'pubis_id' })
  pubisId: string;

  @ManyToOne(() => Collection, (collection) => collection.pubis)
  @JoinColumn([{ name: 'collection_id', referencedColumnName: 'id' }])
  collection: Collection;

  @ManyToOne(() => Pubis, (pubis) => pubis.collections)
  @JoinColumn([{ name: 'pubis_id', referencedColumnName: 'id' }])
  pubis: Pubis;
}
