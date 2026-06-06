import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * Extrae la IP del cliente. Soporta REST y GraphQL.
 * Prefiere X-Forwarded-For si está presente (proxy/reverse proxy).
 */
export const ClientIp = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | null => {
    const req =
      ctx.getType<'graphql' | 'http' | 'ws' | 'rpc'>() === 'graphql'
        ? GqlExecutionContext.create(ctx).getContext().req
        : ctx.switchToHttp().getRequest();
    if (!req) return null;
    const fwd: string | undefined = req.headers?.['x-forwarded-for'];
    if (fwd) return fwd.split(',')[0]!.trim();
    return req.ip ?? req.connection?.remoteAddress ?? null;
  },
);
