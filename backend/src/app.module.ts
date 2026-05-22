import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './user.entity';
import { Note } from './note.entity';
import { Category } from './category.entity';
import { RefreshToken } from './auth/refresh-token.entity';
import { AuthModule } from './auth/auth.module';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { NoteController } from './note.controller';
import { NoteService } from './note.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST') || 'localhost',
        port: configService.get<number>('DB_PORT') || 5432,
        username: configService.get<string>('DB_USER') || 'postgres',
        password: configService.get<string>('DB_PASSWORD') || '123',
        database: configService.get<string>('DB_NAME') || 'demo1',
        entities: [User, Note, Category, RefreshToken],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Category, Note, RefreshToken]),
    AuthModule,
  ],
  controllers: [AppController, CategoryController, NoteController],
  providers: [AppService, CategoryService, NoteService],
})
export class AppModule {}
