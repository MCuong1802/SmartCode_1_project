import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn, 
  OneToMany 
} from 'typeorm';
import { Note } from '../note/note.entity';
import { Category } from '../category/category.entity';

@Entity('users') // Tên bảng trong database
export class User {
  @PrimaryGeneratedColumn('uuid') // Khớp với kiểu id uuid của bạn
  id!: string;

  @Column({ name: 'full_name', type: 'varchar', length: 100 })
  fullName!: string;

  @Column({ type: 'varchar', length: 150 })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  // Thiết lập mối quan hệ 1 User có Nhiều Notes (1-N)
  @OneToMany(() => Note, (note) => note.user)
  notes!: Note[];

  // Thiết lập mối quan hệ 1 User có Nhiều Categories (1-N)
  @OneToMany(() => Category, (category) => category.user)
  categories!: Category[];
}
