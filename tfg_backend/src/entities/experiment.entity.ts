import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';
import { Pubis } from './pubis.entity';

@Entity()
export class Experiment {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column({ type: 'timestamp' })
  create_date: Date;

  @ManyToOne(() => User, (user) => user.experiments)
  user: User;

  @ManyToOne(() => Pubis, (pubis) => pubis.experiments)
  pubis: Pubis;
}
