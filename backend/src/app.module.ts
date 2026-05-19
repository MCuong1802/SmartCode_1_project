import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Note } from './note.entity';
import { Category } from './category.entity';
import { AuthModule } from './auth/auth.module';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { NoteController } from './note.controller';
import { NoteService } from './note.service';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '123',
      database: 'demo1',
      entities: [User, Note, Category],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User, Category, Note]),
    AuthModule,
  ],
  controllers: [AppController, CategoryController, NoteController],
  providers: [AppService, CategoryService, NoteService],
})
export class AppModule {}
