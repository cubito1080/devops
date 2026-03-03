import { Continent } from '../continent/continent.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Country {
  @PrimaryGeneratedColumn()
  country_id!: number;

  @ManyToOne(() => Continent, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'continent_id' })
  continent!: Continent;

  @Column()
  name!: string;

  @Column('bigint')
  population!: number;

  @Column()
  net_area!: number;

  @Column('jsonb')
  political_system!: string[];

  @Column('jsonb')
  economical_index!: Record<string, number>;

  @Column('jsonb')
  languages!: string[];
}
