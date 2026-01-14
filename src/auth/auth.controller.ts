import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return {
      message: 'Perfil obtenido exitosamente',
      user: req.user,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('protected')
  protectedRoute(@Request() req: any) {
    return {
      message: `Hola ${req.user.nombre}. Esta es una ruta protegida.`,
      timestamp: new Date().toISOString(),
      userId: req.user.userId,
    };
  }
}
