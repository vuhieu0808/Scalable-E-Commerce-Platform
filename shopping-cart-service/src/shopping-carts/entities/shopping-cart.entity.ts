import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ShoppingCartItem } from './shopping-cart-item.entity';

@Entity({ name: 'shopping-carts' })
export class ShoppingCart {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'uuid' })
  userId!: string;

  @OneToMany(() => ShoppingCartItem, (item) => item.shoppingCart, {
    cascade: true,
  })
  items!: ShoppingCartItem[];

  @CreateDateColumn({ type: 'date' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'date' })
  updatedAt!: Date;
}
