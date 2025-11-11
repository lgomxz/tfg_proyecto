import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy'; // Importamos JwtStrategy
import { UserModule } from '../user/user.module'; // Módulo de usuario para gestionar datos de usuario
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UserModule, // Importamos el módulo del usuario
    PassportModule, // Importamos PassportModule para usar estrategias como JWT
    ConfigModule, // Importamos ConfigModule para usar variables de entorno
    JwtModule.registerAsync({
      imports: [ConfigModule], // Asegura que ConfigModule esté disponible
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // Obtenemos el secreto JWT desde las variables de entorno
        signOptions: { expiresIn: '1h' }, // Configuramos la expiración del token a 1 hora
      }),
      inject: [ConfigService], // Inyectamos el ConfigService para obtener el JWT_SECRET
    }),
  ],
  providers: [AuthService, JwtStrategy], // Registramos AuthService y JwtStrategy
  controllers: [AuthController], // Registramos AuthController
})
export class AuthModule {}
