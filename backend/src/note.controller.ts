import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
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

  @Delete(':id')
  async delete(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.sub;
    await this.noteService.delete(userId, id);
    return { message: 'Xóa ghi chú thành công!' };
  }
}
