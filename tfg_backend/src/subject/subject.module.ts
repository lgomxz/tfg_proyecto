import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubjectService } from './subject.service';
import { SubjectController } from './subject.controller';
import { Subject } from 'src/entities/subject.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subject]), // Asegúrate de que estás importando la entidad aquí
  ],
  controllers: [SubjectController],
  providers: [SubjectService],
  exports: [SubjectService], // Opcional: si necesitas usarlo en otros módulos
})
export class SubjectModule {}
