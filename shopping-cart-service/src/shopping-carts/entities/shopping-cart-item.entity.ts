import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ShoppingCart } from './shopping-cart.entity';

@Entity({ name: 'shopping-cart-items' })
export class ShoppingCartItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  productId!: string;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ type: 'uuid' })
  shoppingCartId!: string;

  @ManyToOne(() => ShoppingCart, (shoppingCart) => shoppingCart.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'shoppingCartId' })
  shoppingCart!: ShoppingCart;

  @CreateDateColumn({ type: 'date' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'date' })
  updatedAt!: Date;
}
