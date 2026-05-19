import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // Nhúng bảng User vào để thao tác
    JwtModule.register({
      global: true, // Cho phép dùng JWT ở bất kỳ file nào
      secret: 'CHIA_KHOA_BI_MAT_CUA_BAN', // Thực tế sau này sẽ giấu vào file .env
      signOptions: { expiresIn: '1h' }, // Token sẽ hết hạn sau 1 tiếng
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController]
})
export class AuthModule { }
