import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('chain_event')
export class ChainEvent {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  trace_id!: string;

  @Column({ type: 'varchar', default: 'entrada' })
  direccion!: string;

  @Column({ type: 'varchar', default: 'pendiente' })
  estado!: string;

  @Column({ type: 'varchar', nullable: true })
  sistema_origen!: string | null;

  @Column({ type: 'varchar', nullable: true })
  sistema_destino!: string | null;

  @Column({ type: 'varchar', nullable: true })
  endpoint!: string | null;

  @Column({ type: 'varchar', default: 'POST' })
  metodo!: string;

  @Column({ type: 'int', nullable: true })
  status_code!: number | null;

  @Column({ type: 'jsonb', nullable: true })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  request_json!: Record<string, any> | null;

  @Column({ type: 'jsonb', nullable: true })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  response_json!: Record<string, any> | null;

  @Column({ type: 'text', nullable: true })
  error!: string | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
