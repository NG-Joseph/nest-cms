import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Use this to inject authenticated userss
 */
export const AuthUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);