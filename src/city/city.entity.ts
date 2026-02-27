import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class City {
  @PrimaryGeneratedColumn()
  city_id!: number;

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
