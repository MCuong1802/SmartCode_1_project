import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AppService {
 constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>, // Nhúng Repository của bảng User vào đây
  ) {}

  // Hàm lấy toàn bộ danh sách User từ PostgreSQL
  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }

  // Lấy chi tiết thông tin cá nhân của User đang đăng nhập
  async getProfile(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('Không tìm thấy người dùng!');
    }
    return user;
  }

  // Cập nhật thông tin cá nhân (Họ tên, Email)
  async updateProfile(userId: string, fullName: string, email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('Không tìm thấy người dùng!');
    }
    user.fullName = fullName;
    user.email = email;
    return this.userRepository.save(user);
  }
}
