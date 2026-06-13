import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar' })
  email!: string;

  @Column({ type: 'varchar' })
  hashedPassword!: string;

  @Column({ type: 'varchar', nullable: true })
  name?: string | null;

  @Column({ type: 'varchar', nullable: true })
  phoneNumber?: string | null;

  @CreateDateColumn({ type: 'date' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'date' })
  updatedAt!: Date;
}
