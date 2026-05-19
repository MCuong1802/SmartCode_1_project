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
}
