import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from './auth/auth.guard';
import { CategoryService } from './category.service';

@Controller('categories')
@UseGuards(AuthGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async findAll(@Req() req: any) {
    const userId = req.user.sub;
    const categories = await this.categoryService.findAll(userId);
    return categories.map((cat) => ({
      id: cat.id,
      title: cat.title,
      description: cat.description,
      icon: cat.icon,
      colorName: cat.colorName,
      notesCount: cat.notes?.length || 0,
    }));
  }

  @Post()
  async create(
    @Req() req: any,
    @Body() body: { title: string; description?: string; icon?: string; colorName?: string },
  ) {
    const userId = req.user.sub;
    return this.categoryService.create(userId, body);
  }

  @Delete(':id')
  async delete(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.sub;
    await this.categoryService.delete(userId, id);
    return { message: 'Xóa danh mục thành công!' };
  }
}
