import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService
  ) { }

  // 1. XỬ LÝ ĐĂNG KÝ
  async register(fullName: string, email: string, pass: string) {
    // Kiểm tra xem email đã tồn tại chưa
    const checkUser = await this.userRepository.findOne({ where: { email } });
    if (checkUser) {
      throw new HttpException('Email này đã được sử dụng!', HttpStatus.BAD_REQUEST);
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(pass, 10);

    // Lưu vào database
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
    // Tìm user theo email
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new HttpException('Sai email hoặc mật khẩu', HttpStatus.UNAUTHORIZED);
    }

    // So sánh mật khẩu người dùng nhập với mật khẩu đã mã hóa trong DB
    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new HttpException('Sai email hoặc mật khẩu', HttpStatus.UNAUTHORIZED);
    }

    // Sinh Token mang theo ID và Email của người dùng
    const payload = { sub: user.id, email: user.email };
    return {
      message: 'Đăng nhập thành công',
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  // 3. LẤY THÔNG TIN HỒ SƠ
  async getProfile(userId: string) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new HttpException('Không tìm thấy người dùng', HttpStatus.NOT_FOUND);
    return { id: user.id, fullName: user.fullName, email: user.email, createdAt: user.createdAt };
  }

  // 4. CẬP NHẬT HỒ SƠ
  async updateProfile(userId: string, fullName: string) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new HttpException('Không tìm thấy người dùng', HttpStatus.NOT_FOUND);
    user.fullName = fullName;
    await this.userRepository.save(user);
    return { message: 'Cập nhật hồ sơ thành công!', fullName: user.fullName };
  }
}