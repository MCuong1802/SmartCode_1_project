import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoteController } from '../note.controller';
import { NoteService } from '../note.service';
import { Note } from '../note.entity';
import { User } from '../user.entity';
import { Category } from '../category.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Note, User, Category])],
    controllers: [NoteController],
    providers: [NoteService],
})
export class NoteModule { }
