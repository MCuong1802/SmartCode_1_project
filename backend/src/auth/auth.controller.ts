import { Controller, Post, Body, Req, Res, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService
  ) {}

  @Post('register')
  register(@Body() body: any) {
    return this.authService.register(body.fullName, body.email, body.password);
  }

  @Post('login')
  async login(@Body() body: any, @Res() res: Response) {
    const result = await this.authService.login(body.email, body.password);
    
    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Dùng lax thay vì strict để đỡ lỗi CORS ở dev, có thể tinh chỉnh sau
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    
    return res.json({ message: result.message, access_token: result.access_token });
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) throw new UnauthorizedException('Missing refresh token');

    const stored = await this.authService.validateRefreshToken(refreshToken);
    if (!stored) throw new UnauthorizedException('Invalid refresh token');

    const payload = { sub: stored.user.id, email: stored.user.email };
    const newAccess = await this.jwtService.signAsync(payload);

    await this.authService.rotateRefreshToken(stored);

    return res.json({ access_token: newAccess });
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const token = req.cookies['refresh_token'];
    if (token) {
      await this.authService.revokeRefreshToken(token);
    }
    res.clearCookie('refresh_token');
    return res.json({ message: 'Đăng xuất thành công' });
  }
}