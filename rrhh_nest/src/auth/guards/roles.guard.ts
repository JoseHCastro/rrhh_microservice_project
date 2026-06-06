import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthenticatedUser } from '../types';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const user = this.extractUser(context);
    if (!user) throw new ForbiddenException('No autenticado');

    const ok = required.some((r) => user.roles.includes(r));
    if (!ok) {
      throw new ForbiddenException(
        `Requiere uno de los roles: ${required.join(', ')}`,
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
