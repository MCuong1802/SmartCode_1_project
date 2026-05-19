import { Controller, Post, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('register')
  register(@Body() body: any) {
    return this.authService.register(body.fullName, body.email, body.password);
  }

  @Post('login')
  login(@Body() body: any) {
    return this.authService.login(body.email, body.password);
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  getProfile(@Req() req: any) {
    return this.authService.getProfile(req.user.sub);
  }

  @Patch('profile')
  @UseGuards(AuthGuard)
  updateProfile(@Req() req: any, @Body() body: { fullName: string }) {
    return this.authService.updateProfile(req.user.sub, body.fullName);
  }
}