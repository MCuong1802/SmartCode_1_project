import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import type { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { NoteService } from './note.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Note } from './note.entity';

export interface NoteResponse {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  category: {
    id: string;
    title: string;
    colorName?: string;
    icon?: string;
  } | null;
}

const formatNoteResponse = (note: Note): NoteResponse => ({
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
});

@Controller('notes')
@UseGuards(AuthGuard)
export class NoteController {
  constructor(private readonly noteService: NoteService) { }

  @Get()
  async findAll(@Req() req: RequestWithUser): Promise<NoteResponse[]> {
    const userId = req.user.sub;
    const notes = await this.noteService.findAll(userId);
    return notes.map(formatNoteResponse);
  }

  @Post()
  async create(
    @Req() req: RequestWithUser,
    @Body() body: CreateNoteDto,
  ) {
    const userId = req.user.sub;
    const note = await this.noteService.create(userId, body);
    return formatNoteResponse(note);
  }

  @Put(':id')
  async update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() body: UpdateNoteDto,
  ) {
    const userId = req.user.sub;
    const note = await this.noteService.update(userId, id, body);
    return {
      message: 'Cập nhật ghi chú thành công!',
      note: formatNoteResponse(note)
    };
  }

  @Get('trash')
  async findTrash(@Req() req: RequestWithUser): Promise<NoteResponse[]> {
    const userId = req.user.sub;
    const notes = await this.noteService.findTrash(userId);
    return notes.map(formatNoteResponse);
  }

  @Put('trash/:id/restore')
  async restore(@Req() req: RequestWithUser, @Param('id') id: string) {
    const userId = req.user.sub;
    await this.noteService.restore(userId, id);
    return { message: 'Khôi phục ghi chú thành công!' };
  }

  @Delete('trash/:id/force')
  async forceDelete(@Req() req: RequestWithUser, @Param('id') id: string) {
    const userId = req.user.sub;
    await this.noteService.forceDelete(userId, id);
    return { message: 'Xóa vĩnh viễn ghi chú thành công!' };
  }

  @Get(':id')
  async findOne(@Req() req: RequestWithUser, @Param('id') id: string): Promise<NoteResponse> {
    const userId = req.user.sub;
    const note = await this.noteService.findOne(userId, id);
    return formatNoteResponse(note);
  }

  @Delete(':id')
  async delete(@Req() req: RequestWithUser, @Param('id') id: string) {
    const userId = req.user.sub;
    await this.noteService.delete(userId, id);
    return { message: 'Xóa ghi chú thành công!' };
  }
}
