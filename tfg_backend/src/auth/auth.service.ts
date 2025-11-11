import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from 'src/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  // Método para validar credenciales de usuario
  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.validateUser(email, password);
    //Si no se encuentra el usuario o la contraseña es incorrecta, se lanza excepción
    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }
    return user;
  }

  // Genera token JWT al iniciar sesión
  async login(
    user: User,
    rememberMe: boolean,
  ): Promise<{ access_token: string }> {
    const payload = {
      email: user.email,
      sub: user.id,
    };

    // Controla el tiempo de validez de la firma del token
    const expiresIn = rememberMe ? '30d' : '5h'; // 30 días o 1 hora

    // Se devuelve el token firmado
    return {
      access_token: this.jwtService.sign(payload, { expiresIn }), // Firma el token JWT con expiración ajustada
    };
  }
}
