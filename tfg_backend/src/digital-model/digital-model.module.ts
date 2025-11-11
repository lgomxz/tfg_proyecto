import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DigitalModelService } from './digital-model.service';
import { DigitalModelController } from './digital-model.controller';
import { DigitalModel } from 'src/entities/model.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DigitalModel]), // Asegúrate de que estás importando la entidad aquí
  ],
  controllers: [DigitalModelController],
  providers: [DigitalModelService],
  exports: [DigitalModelService], // Opcional: si necesitas usarlo en otros módulos
})
export class DigitalModelModule {}
