import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PRIVILEGES_KEY } from '../decorators/require-privilege.decorator';
import { AuthenticatedUser } from '../types';

@Injectable()
export class PrivilegeGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(PRIVILEGES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const user = this.extractUser(context);
    if (!user) throw new ForbiddenException('No autenticado');

    // ROLE_ADMIN tiene acceso a todo (bypass de privilegios finos)
    if (user.roles.includes('ROLE_ADMIN')) return true;

    const ok = required.some((p) => user.privilegios.includes(p));
    if (!ok) {
      throw new ForbiddenException(
        `Requiere uno de los privilegios: ${required.join(', ')}`,
      );
    }
    return true;
  }

  private extractUser(ctx: ExecutionContext): AuthenticatedUser | undefined {
    if (ctx.getType<'graphql' | 'http' | 'ws' | 'rpc'>() === 'graphql') {
      return GqlExecutionContext.create(ctx).getContext().req?.user;
    }
    return ctx.switchToHttp().getRequest().user;
  }
}
