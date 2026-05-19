import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn, 
  DeleteDateColumn,
  ManyToOne, 
  JoinColumn 
} from 'typeorm';
import { User } from './user.entity';
import { Category } from './category.entity';

@Entity('notes')
export class Note {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  content!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  // Thiết lập mối quan hệ: Nhiều Notes thuộc về 1 User
  @ManyToOne(() => User, (user) => user.notes)
  @JoinColumn({ name: 'user_id' }) // Chỉ định cột khóa ngoại trong pgAdmin
  user!: User;

  // Thiết lập mối quan hệ: Nhiều Notes thuộc về 1 Category
  @ManyToOne(() => Category, (category) => category.notes, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category?: Category;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date;
}