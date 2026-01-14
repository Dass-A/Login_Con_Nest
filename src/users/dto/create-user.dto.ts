import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @MinLength(2)
    @MaxLength(80)
    nombre: string;

    @IsString()
    @MinLength(2)
    @MaxLength(80)
    apellido: string;

    @IsString()
    @MinLength(3)
    @MaxLength(40)
    username: string;

    @IsEmail()
    @MaxLength(150)
    email: string;

    @IsString()
    @MinLength(6)
    @MaxLength(50)
    password: string;
}
