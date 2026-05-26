import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { User } from '../user/user.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

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

  async create(userId: string, data: CreateCategoryDto): Promise<Category> {
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

  async findOne(userId: string, id: string): Promise<Category> {
    const category = await this.categoryRepo.findOne({
      where: { id, user: { id: userId } },
      relations: ['notes'],
    });
    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục!');
    }
    return category;
  }

  async update(
    userId: string,
    id: string,
    data: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.categoryRepo.findOne({
      where: { id, user: { id: userId } },
    });
    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục để cập nhật!');
    }
    Object.assign(category, data);
    return this.categoryRepo.save(category);
  }

  async delete(userId: string, id: string): Promise<void> {
    const category = await this.categoryRepo.findOne({
      where: { id, user: { id: userId } },
      relations: ['notes'],
    });
    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục để xóa!');
    }
    if (category.notes && category.notes.length > 0) {
      throw new BadRequestException('Không thể xóa danh mục này vì đang có ghi chú đang sử dụng!');
    }
    await this.categoryRepo.remove(category);
  }
}
