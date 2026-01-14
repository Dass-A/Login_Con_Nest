import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private users: User[] = [];
  private idCounter = 1;

  create(createUserDto: CreateUserDto): Omit<User, 'password'> {
    const now = new Date();

    const newUser: User = {
      id: this.idCounter++,
      nombre: createUserDto.nombre,
      apellido: createUserDto.apellido,
      username: createUserDto.username,
      email: createUserDto.email.toLowerCase().trim(),
      password: createUserDto.password, // OJO: aquí ya debe venir HASHEADA desde AuthService
      createdAt: now,
      updatedAt: now,
      isActive: true,
    };

    this.users.push(newUser);
    return this.sanitize(newUser);
  }

  findAll(): Omit<User, 'password'>[] {
    return this.users.map((u) => this.sanitize(u));
  }

  findOne(id: number): Omit<User, 'password'> {
    const user = this.users.find((u) => u.id === id);
    if (!user) throw new NotFoundException(`Usuario con id ${id} no existe`);
    return this.sanitize(user);
  }

  //Clave para login/registro: “obtener user por email si existe”
  findByEmail(email: string): User | undefined {
    return this.users.find(
      (u) => u.email === email.toLowerCase().trim(),
    );
  }

  // Útil para login porque necesitas password (hash)
  findByEmailWithPassword(email: string): User | undefined {
    return this.findByEmail(email);
  }

  update(id: number, updateUserDto: UpdateUserDto): Omit<User, 'password'> {
    const user = this.users.find((u) => u.id === id);
    if (!user) throw new NotFoundException(`Usuario con id ${id} no existe`);

    if (updateUserDto.nombre !== undefined) user.nombre = updateUserDto.nombre;
    if (updateUserDto.apellido !== undefined) user.apellido = updateUserDto.apellido;
    if (updateUserDto.username !== undefined) user.username = updateUserDto.username;
    if (updateUserDto.email !== undefined) user.email = updateUserDto.email.toLowerCase().trim();

    // si tu guía permite cambiar password, aquí debería venir HASHEADA también
    if (updateUserDto.password !== undefined) user.password = updateUserDto.password;


    user.updatedAt = new Date();

    return this.sanitize(user);
  }

  // Borrado lógico (recomendado)
  remove(id: number): { message: string } {
    const user = this.users.find((u) => u.id === id);
    if (!user) throw new NotFoundException(`Usuario con id ${id} no existe`);

    user.isActive = false;
    user.updatedAt = new Date();

    return { message: `Usuario ${id} desactivado correctamente` };
  }

  private sanitize(user: User): Omit<User, 'password'> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safe } = user;
    return safe;
  }
}
