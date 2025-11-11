import {
  Controller,
  Post,
  Body,
  Request,
  Response,
  UseGuards,
  Get,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from 'src/user/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private userService: UserService,
  ) {}

  // Login de usuario
  @Post('login')
  async login(
    @Body() body: { email: string; password: string; rememberMe: boolean },
    @Response({ passthrough: true }) response,
  ) {
    const user = await this.authService.validateUser(body.email, body.password);
    const { access_token } = await this.authService.login(
      user,
      body.rememberMe,
    );

    response.send({ message: 'Login successful', token: access_token });
  }

  @UseGuards(AuthGuard('jwt')) //Protegemos la ruta usando JWT
  @Get('profile')
  getProfile(@Request() req) {
    // Datos básicos del usuario
    return {
      message: 'User data',
      id: req.user.id,
      email: req.user.email,
    };
  }

  // Verifica la sesión activa
  @UseGuards(AuthGuard('jwt'))
  @Get('check-session')
  checkSession(@Request() req: any) {
    return { isAuthenticated: true, user: req.user };
  }

  // Logout de usuario
  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  logout(@Request() req, @Response({ passthrough: true }) response) {
    return { message: 'Logout successful' };
  }

  // Endpoint para solicitar el token de restablecimiento de contraseña
  @Post('forgot-password')
  async forgotPassword(
    @Body('email') email: string,
  ): Promise<{ message: string }> {
    await this.userService.sendResetPasswordEmail(email);
    return { message: 'Email sent with password reset instructions' };
  }

  // Endpoint para restablecer la contraseña
  @Post('reset-password/:token')
  async resetPassword(
    @Param('token') token: string,
    @Body('newPassword') newPassword: string,
  ): Promise<{ message: string }> {
    await this.userService.resetPassword(token, newPassword);
    return { message: 'Password reset successfully' };
  }
}
