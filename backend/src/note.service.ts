import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull, LessThan } from 'typeorm';
import { Note } from './note.entity';
import { User } from './user.entity';
import { Category } from './category.entity';

@Injectable()
export class NoteService {
  constructor(
    @InjectRepository(Note)
    private noteRepo: Repository<Note>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
  ) {}

  async findAll(userId: string): Promise<Note[]> {
    return this.noteRepo.find({
      where: { user: { id: userId } },
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(
    userId: string,
    data: { title: string; content: string; categoryId?: string },
  ): Promise<Note> {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản người dùng!');
    }
    
    let category: Category | null = null;
    if (data.categoryId) {
      category = await this.categoryRepo.findOne({
        where: { id: data.categoryId, user: { id: userId } },
      });
    }

    const note = this.noteRepo.create({
      title: data.title,
      content: data.content,
      user,
      category: category || undefined,
    });
    return this.noteRepo.save(note);
  }

  async delete(userId: string, id: string): Promise<void> {
    const note = await this.noteRepo.findOne({
      where: { id, user: { id: userId } },
    });
    if (!note) {
      throw new NotFoundException('Không tìm thấy ghi chú để xóa!');
    }
    await this.noteRepo.softRemove(note);
  }

  async update(
    userId: string,
    id: string,
    data: { title: string; content: string; categoryId?: string },
  ): Promise<Note> {
    const note = await this.noteRepo.findOne({
      where: { id, user: { id: userId } },
      relations: ['category'],
    });
    if (!note) {
      throw new NotFoundException('Không tìm thấy ghi chú để cập nhật!');
    }

    if (data.categoryId !== undefined) {
      if (data.categoryId) {
        const category = await this.categoryRepo.findOne({
          where: { id: data.categoryId, user: { id: userId } },
        });
        note.category = category || undefined;
      } else {
        note.category = undefined;
      }
    }

    note.title = data.title;
    note.content = data.content;
    return this.noteRepo.save(note);
  }

  async findOne(userId: string, id: string): Promise<Note> {
    const note = await this.noteRepo.findOne({
      where: { id, user: { id: userId } },
      relations: ['category'],
    });
    if (!note) {
      throw new NotFoundException('Không tìm thấy ghi chú!');
    }
    return note;
  }

  async cleanOldTrash(userId: string): Promise<void> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const oldNotes = await this.noteRepo.find({
      where: {
        user: { id: userId },
        deletedAt: LessThan(sevenDaysAgo),
      },
      withDeleted: true,
    });

    if (oldNotes.length > 0) {
      await this.noteRepo.remove(oldNotes);
    }
  }

  async findTrash(userId: string): Promise<Note[]> {
    await this.cleanOldTrash(userId);

    return this.noteRepo.find({
      where: {
        user: { id: userId },
        deletedAt: Not(IsNull()),
      },
      withDeleted: true,
      relations: ['category'],
      order: { deletedAt: 'DESC' },
    });
  }

  async restore(userId: string, id: string): Promise<Note> {
    const note = await this.noteRepo.findOne({
      where: { id, user: { id: userId }, deletedAt: Not(IsNull()) },
      withDeleted: true,
    });
    if (!note) {
      throw new NotFoundException('Không tìm thấy ghi chú trong thùng rác!');
    }
    note.deletedAt = undefined;
    return this.noteRepo.save(note);
  }

  async forceDelete(userId: string, id: string): Promise<void> {
    const note = await this.noteRepo.findOne({
      where: { id, user: { id: userId }, deletedAt: Not(IsNull()) },
      withDeleted: true,
    });
    if (!note) {
      throw new NotFoundException('Không tìm thấy ghi chú trong thùng rác để xóa vĩnh viễn!');
    }
    await this.noteRepo.remove(note);
  }
}
