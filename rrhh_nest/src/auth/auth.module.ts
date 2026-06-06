import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { PrivilegeGuard } from './guards/privilege.guard';

@Global()
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    // Solo verificación, no emisión (el login vive en Spring Boot)
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: Buffer.from(config.getOrThrow<string>('JWT_SECRET'), 'base64'),
        signOptions: { algorithm: 'HS256' },
      }),
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    // Guards globales — aplican a todos los resolvers y controllers
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: PrivilegeGuard },
  ],
  exports: [AuthService],
})
export class AuthModule {}
