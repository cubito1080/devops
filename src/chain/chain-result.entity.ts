import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ChainResult {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn()
  received_at!: Date;

  @Column({ type: 'varchar', nullable: true })
  origen!: string | null;

  @Column('jsonb')
  result!: Record<string, any>;
}
