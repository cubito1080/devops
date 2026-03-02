import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Continent {
  @PrimaryGeneratedColumn()
  continent_id!: number;

  @Column()
  name!: string;

  @Column()
  net_area!: number;

  @Column('jsonb')
  geology!: string[]; // the composition of the continent, it focuses on chemical composition , types of rocks and the age of the material

  @Column('jsonb')
  structure!: string[]; //it refers how pieces are organized and how they are conected with tectonically

  @Column('float')
  change_ratio!: number; // the rate at which the continent is changing in terms of area, geology and structure, fixed number

  @Column('bigint')
  population!: number;
}
