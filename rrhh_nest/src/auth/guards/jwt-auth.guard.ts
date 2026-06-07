import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * Guard global de autenticación. Soporta REST y GraphQL en el mismo guard:
 *  - Para REST usa el request normal de Express.
 *  - Para GraphQL extrae el request del contexto Apollo.
 *
 * Respeta @Public() para omitir auth en endpoints específicos
 * (típicamente: webhooks de n8n con su propio secreto).
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context) as boolean | Promise<boolean> | Observable<boolean>;
  }

  getRequest(context: ExecutionContext): unknown {
    if (context.getType<'graphql' | 'http' | 'ws' | 'rpc'>() === 'graphql') {
      return GqlExecutionContext.create(context).getContext().req;
    }
    return context.switchToHttp().getRequest();
  }
}
