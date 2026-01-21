import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * REGISTRO DE USUARIO
   * 1. Verifica que el email no exista
   * 2. Hashea la contraseña
   * 3. Crea el usuario
   * 4. Retorna usuario sin contraseña
   */
  async register(registerDto: RegisterDto) {
    const email = registerDto.email.toLowerCase().trim();

    // 1) Verifica que el email no exista
    const existingUser = this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // 2) Hashea la contraseña
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // 3) Crea el usuario (guardando password hasheada)
    const userCreated = this.usersService.create({
      ...registerDto,
      email,
      password: hashedPassword,
    });

    // 4) Retorna usuario sin contraseña
    return {
      message: 'Usuario registrado correctamente',
      user: userCreated,
    };
  }

  /**
   * LOGIN DE USUARIO
   * 1. Busca usuario por email
   * 2. Verifica contraseña
   * 3. Genera token JWT
   * 4. Retorna token + user sin password
   */
  async login(loginDto: LoginDto) {
    const email = loginDto.email.toLowerCase().trim();

    // 1) Busca usuario por email (con password)
    const user = this.usersService.findByEmailWithPassword(email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Opcional: validar activo
    if (user.isActive === false) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // 2) Verifica contraseña
    const passwordOk = await bcrypt.compare(loginDto.password, user.password);
    if (!passwordOk) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 3) Genera token JWT
    const payload = {
      sub: user.id,
      email: user.email,
      nombre: user.nombre,
      username: user.username,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    // 4) Retorna token + user sin password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = user;

    return {
      access_token: accessToken,
      user: safeUser,
    };
  }

  /**
   * OBTENER PERFIL
   * Retorna información del usuario autenticado
   */
  getProfile(userId: number) {
    // Si tu UsersService.findOne ya devuelve sin password, perfecto.
    return this.usersService.findOne(userId);
  }
}
