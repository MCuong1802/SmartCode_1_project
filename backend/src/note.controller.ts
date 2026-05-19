import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from './auth/auth.guard';
import { NoteService } from './note.service';

@Controller('notes')
@UseGuards(AuthGuard)
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Get()
  async findAll(@Req() req: any) {
    const userId = req.user.sub;
    const notes = await this.noteService.findAll(userId);
    return notes.map((note) => ({
      id: note.id,
      title: note.title,
      content: note.content,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      category: note.category ? {
        id: note.category.id,
        title: note.category.title,
        colorName: note.category.colorName,
        icon: note.category.icon,
      } : null,
    }));
  }

  @Post()
  async create(
    @Req() req: any,
    @Body() body: { title: string; content: string; categoryId?: string },
  ) {
    const userId = req.user.sub;
    return this.noteService.create(userId, body);
  }

  @Put(':id')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { title: string; content: string; categoryId?: string },
  ) {
    const userId = req.user.sub;
    const note = await this.noteService.update(userId, id, body);
    return {
      message: 'Cập nhật ghi chú thành công!',
      note: {
        id: note.id,
        title: note.title,
        content: note.content,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        category: note.category ? {
          id: note.category.id,
          title: note.category.title,
          colorName: note.category.colorName,
          icon: note.category.icon,
        } : null,
      }
    };
  }

  @Get('trash')
  async findTrash(@Req() req: any) {
    const userId = req.user.sub;
    const notes = await this.noteService.findTrash(userId);
    return notes.map((note) => ({
      id: note.id,
      title: note.title,
      content: note.content,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      deletedAt: note.deletedAt,
      category: note.category ? {
        id: note.category.id,
        title: note.category.title,
        colorName: note.category.colorName,
        icon: note.category.icon,
      } : null,
    }));
  }

  @Put('trash/:id/restore')
  async restore(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.sub;
    await this.noteService.restore(userId, id);
    return { message: 'Khôi phục ghi chú thành công!' };
  }

  @Delete('trash/:id/force')
  async forceDelete(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.sub;
    await this.noteService.forceDelete(userId, id);
    return { message: 'Xóa vĩnh viễn ghi chú thành công!' };
  }

  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.sub;
    const note = await this.noteService.findOne(userId, id);
    return {
      id: note.id,
      title: note.title,
      content: note.content,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      category: note.category ? {
        id: note.category.id,
        title: note.category.title,
        colorName: note.category.colorName,
        icon: note.category.icon,
      } : null,
    };
  }

  @Delete(':id')
  async delete(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.sub;
    await this.noteService.delete(userId, id);
    return { message: 'Xóa ghi chú thành công!' };
  }
}
