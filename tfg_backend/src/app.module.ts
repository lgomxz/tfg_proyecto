import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { UserModule } from './user/user.module';
import { CollectionModule } from './collection/collection.module';
import { PubisModule } from './pubis/pubis.module';
import { Collection } from './entities/collection.entity';
import { Pubis } from './entities/pubis.entity';
import { CollectionPubis } from './entities/collection_pubis.entity';
import { RoleModule } from './role/role.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { Experiment } from './entities/experiment.entity';
import { Subject } from './entities/subject.entity';
import { Label } from './entities/label.entity';
import { DigitalModel } from './entities/model.entity';
import { File } from './entities/file.entity';
import { UploadModule } from './upload/upload.module';
import { SubjectModule } from './subject/subject.module';
import { DigitalModelModule } from './digital-model/digital-model.module';
import { FileModule } from './file/file.module';
import * as fs from 'fs';
import { DocumentationModule } from './documentation/documentation.module';
import { CollectionPubisModule } from './pubis_collection/pubis-collection.module';
import { PubisLabelModule } from './pubis_label/pubis-label.module';
import { PubisLabel } from './entities/pubis_label.entity';
import { LabelModule } from './label/label.module';
import { UserCollectionModule } from './user_collections/user_collections.module';
import { ExcelController } from './excel/excel.controller';
import { ExcelModule } from './excel/excel.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT, 
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [
        User,
        Role,
        Collection,
        CollectionPubis,
        Label,
        DigitalModel,
        File,
        Pubis,
        Subject,
        Experiment,
        PubisLabel,
      ],
      autoLoadEntities: true,
      synchronize: false, // Cambiar a false en producción para evitar que TypeORM sincronice automáticamente
    }),
    UserModule,
    CollectionModule,
    CollectionPubisModule,
    PubisModule,
    RoleModule,
    AuthModule,
    SubjectModule,
    DocumentationModule,
    UploadModule,
    DigitalModelModule,
    FileModule,
    LabelModule,
    PubisLabelModule,
    UserCollectionModule,
    ExcelModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  constructor() {
    const filesPath = join(__dirname, '..', '..', 'files');

    fs.readdir(filesPath, (err) => {
      if (err) {
        console.error('Error reading files:', err);
      }
    });
  }
}
