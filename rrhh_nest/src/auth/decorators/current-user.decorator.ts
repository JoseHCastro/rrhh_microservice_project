import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthenticatedUser } from '../types';

/**
 * Extrae el usuario autenticado del contexto (sirve para REST y GraphQL).
 * Uso: foo(@CurrentUser() user: AuthenticatedUser) { ... }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    if (ctx.getType<'graphql' | 'http' | 'ws' | 'rpc'>() === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(ctx);
      return gqlCtx.getContext().req.user;
    }
    return ctx.switchToHttp().getRequest().user;
  },
);
