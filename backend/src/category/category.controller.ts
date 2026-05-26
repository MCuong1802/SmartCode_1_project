import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import type { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './category.entity';

export interface CategoryResponse {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  colorName?: string;
  notesCount: number;
}

const formatCategoryResponse = (cat: Category): CategoryResponse => ({
  id: cat.id,
  title: cat.title,
  description: cat.description,
  icon: cat.icon,
  colorName: cat.colorName,
  notesCount: cat.notes?.length || 0,
});

@Controller('categories')
@UseGuards(AuthGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }

  @Get()
  async findAll(@Req() req: RequestWithUser): Promise<CategoryResponse[]> {
    const userId = req.user.sub;
    const categories = await this.categoryService.findAll(userId);
    return categories.map(formatCategoryResponse);
  }

  @Post()
  async create(
    @Req() req: RequestWithUser,
    @Body() body: CreateCategoryDto,
  ) {
    const userId = req.user.sub;
    const cat = await this.categoryService.create(userId, body);
    return formatCategoryResponse(cat);
  }

  @Get(':id')
  async findOne(@Req() req: RequestWithUser, @Param('id') id: string): Promise<CategoryResponse> {
    const userId = req.user.sub;
    const cat = await this.categoryService.findOne(userId, id);
    return formatCategoryResponse(cat);
  }

  @Put(':id')
  async update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() body: UpdateCategoryDto,
  ) {
    const userId = req.user.sub;
    const cat = await this.categoryService.update(userId, id, body);
    return formatCategoryResponse(cat);
  }

  @Delete(':id')
  async delete(@Req() req: RequestWithUser, @Param('id') id: string) {
    const userId = req.user.sub;
    await this.categoryService.delete(userId, id);
    return { message: 'Xóa danh mục thành công!' };
  }
}
