import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Country } from '../country/country.entity';

@Entity()
export class City {
  @PrimaryGeneratedColumn()
  city_id!: number;

  @ManyToOne(() => Country)
  @JoinColumn({ name: 'country_id' })
  country!: Country;

  @Column()
  city_name!: string;

  @Column('jsonb')
  economical_index!: Record<string, number>;

  @Column('jsonb')
  languages!: string[];

  @Column()
  population!: number;

  @Column()
  net_area!: number;
}
