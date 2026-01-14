// src/auth/strategies/jwt.strategy.ts

// ============================================
// 1) IMPORTACIONES NECESARIAS
// ============================================
//
// Injectable:
// - Marca la clase como "provider" de NestJS.
// - Permite que NestJS la instancie e inyecte automáticamente.
//
// PassportStrategy:
// - Clase base que integra NestJS con Passport.
// - Passport es el middleware que se encarga de estrategias de autenticación.
//
// ExtractJwt y Strategy:
// - Strategy es la estrategia JWT de passport-jwt.
// - ExtractJwt contiene helpers para extraer el token desde header/body/query, etc.
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

// ============================================
// 2) CONFIGURACIÓN DEL SECRETO
// ============================================
//
// JWT_SECRET:
// - Clave usada para FIRMAR y VERIFICAR tokens.
// - En producción debe venir desde variables de entorno.
// - Para un taller se puede definir aquí, pero lo recomendable es usar .env.
//
// Si tu guía lo pide así, lo dejamos como constante.
// Si quieres hacerlo más correcto, usa: process.env.JWT_SECRET
export const JWT_SECRET = 'mi_clave_secreta_muy_segura_2024';

// ============================================
// 3) ESTRATEGIA JWT
// ============================================
//
// Esta clase define cómo se valida un token JWT cuando llega a una ruta protegida.
// La estrategia no crea tokens; eso lo hace AuthService en login.
// La estrategia se usa en conjunto con un Guard (JwtAuthGuard).
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    // ==========================================
    // 3.1) CONSTRUCTOR: CONFIGURACIÓN DE VALIDACIÓN
    // ==========================================
    //
    // El super(...) configura cómo Passport debe:
    // - Extraer el token (jwtFromRequest)
    // - Rechazar tokens expirados (ignoreExpiration)
    // - Verificar la firma con secretOrKey
    constructor() {
        super({
            // jwtFromRequest:
            // Busca el token en el header HTTP Authorization con el formato:
            // Authorization: Bearer <token>
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

            // ignoreExpiration:
            // false = NO aceptar tokens expirados (lo correcto).
            ignoreExpiration: false,

            // secretOrKey:
            // Clave con la que se verifica la firma.
            // Debe coincidir con la usada al firmar el token en el login.
            secretOrKey: JWT_SECRET,
        });
    }

    // ==========================================
    // 3.2) VALIDATE: QUÉ HACER CUANDO EL TOKEN ES VÁLIDO
    // ==========================================
    //
    // Este método se ejecuta automáticamente si:
    // 1) Llega un token en Authorization: Bearer ...
    // 2) La firma es válida con secretOrKey
    // 3) El token no está expirado (ignoreExpiration=false)
    //
    // payload:
    // Es el contenido decodificado del token.
    // Ejemplo típico:
    // {
    //   sub: 1,
    //   email: "juan@test.com",
    //   nombre: "Juan Pérez",
    //   iat: 1705312200,
    //   exp: 1705398600
    // }
    //
    // Lo que retorne validate() se asigna a req.user.
    async validate(payload: any) {
        return {
            userId: payload.sub,
            email: payload.email,
            nombre: payload.nombre,
        };
    }
}
