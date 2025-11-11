import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    // Se llama al constructor del JWT
    super({
      jwtFromRequest: (req) => {
        // Se lee el token del header
        const token = req.headers['authorization']?.split(' ')[1];
        return token || null;
      },
      ignoreExpiration: false, // No ignorar la expiración del token
      secretOrKey: configService.get<string>('JWT_SECRET'), // Clave secreta para verificar token
    });
  }

  // Validación del payload del JWT
  async validate(payload: any) {
    // Se busca el suuario en la bbdd usando ID del payload
    const user = await this.userService.getById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    // Se devuelve el usuario encontrado
    return user;
  }
}
