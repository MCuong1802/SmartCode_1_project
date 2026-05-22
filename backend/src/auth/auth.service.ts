import { Injectable, HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../user.entity';
import { RefreshToken } from './refresh-token.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepo: Repository<RefreshToken>,
    private jwtService: JwtService
  ) {}

  // 1. XỬ LÝ ĐĂNG KÝ
  async register(fullName: string, email: string, pass: string) {
    const checkUser = await this.userRepository.findOne({ where: { email } });
    if (checkUser) {
      throw new HttpException('Email này đã được sử dụng!', HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(pass, 10);
    
    const newUser = this.userRepository.create({
      fullName,
      email,
      password: hashedPassword,
    });
    await this.userRepository.save(newUser);
    
    return { message: 'Đăng ký tài khoản thành công!' };
  }

  // 2. XỬ LÝ ĐĂNG NHẬP
  async login(email: string, pass: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new HttpException('Sai email hoặc mật khẩu', HttpStatus.UNAUTHORIZED);
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new HttpException('Sai email hoặc mật khẩu', HttpStatus.UNAUTHORIZED);
    }

    const payload = { sub: user.id, email: user.email };
    const access_token = await this.jwtService.signAsync(payload);
    
    // Generate refresh token
    const refreshToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 ngày

    await this.refreshTokenRepo.save({
      token: refreshToken,
      user: user,
      expiresAt,
    });

    return {
      message: 'Đăng nhập thành công',
      access_token,
      refresh_token: refreshToken,
    };
  }

  // 3. XÁC THỰC REFRESH TOKEN
  async validateRefreshToken(token: string) {
    const stored = await this.refreshTokenRepo.findOne({
      where: { token },
      relations: ['user'],
    });

    if (!stored || stored.expiresAt < new Date()) {
      if (stored) {
        await this.refreshTokenRepo.delete(stored.id); // xóa nếu đã hết hạn
      }
      return null;
    }
    return stored;
  }

  // 4. XOAY VÒNG REFRESH TOKEN
  async rotateRefreshToken(oldToken: RefreshToken) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // cập nhật lại 7 ngày

    oldToken.expiresAt = expiresAt;
    return this.refreshTokenRepo.save(oldToken);
  }

  // 5. THU HỒI REFRESH TOKEN
  async revokeRefreshToken(token: string) {
    await this.refreshTokenRepo.delete({ token });
  }
}