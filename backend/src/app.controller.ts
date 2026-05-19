import { Controller, Get, Put, Body, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { User } from './user.entity';
import { AuthGuard } from './auth/auth.guard';

@Controller('user')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getUsers(): Promise<User[]> {
    return await this.appService.getAllUsers();
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  async getProfile(@Req() req: any) {
    const userId = req.user.sub;
    const user = await this.appService.getProfile(userId);
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
    };
  }

  @Put('profile')
  @UseGuards(AuthGuard)
  async updateProfile(
    @Req() req: any,
    @Body() body: { fullName: string; email: string },
  ) {
    const userId = req.user.sub;
    const user = await this.appService.updateProfile(userId, body.fullName, body.email);
    return {
      message: 'Cập nhật thông tin cá nhân thành công!',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
      }
    };
  }
}
