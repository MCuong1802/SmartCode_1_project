import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth') // Đường dẫn gốc là /auth
export class AuthController {
  constructor(private authService: AuthService) {}

  // API Đăng ký: POST http://localhost:3001/auth/register
  @Post('register')
  register(@Body() body: any) {
    return this.authService.register(body.fullName, body.email, body.password);
  }

  // API Đăng nhập: POST http://localhost:3001/auth/login
  @Post('login')
  login(@Body() body: any) {
    return this.authService.login(body.email, body.password);
  }
}