import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { User } from './user.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async findAll(userId: string): Promise<Category[]> {
    return this.categoryRepo.find({
      where: { user: { id: userId } },
      relations: ['notes'],
      order: { createdAt: 'ASC' },
    });
  }

  async create(userId: string, data: { title: string; description?: string; icon?: string; colorName?: string }): Promise<Category> {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản người dùng!');
    }
    const category = this.categoryRepo.create({
      ...data,
      user,
    });
    return this.categoryRepo.save(category);
  }

  async delete(userId: string, id: string): Promise<void> {
    const category = await this.categoryRepo.findOne({
      where: { id, user: { id: userId } },
    });
    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục để xóa!');
    }
    await this.categoryRepo.remove(category);
  }
}
