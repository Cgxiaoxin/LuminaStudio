import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const TenantId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): number | undefined => {
    const request = ctx.switchToHttp().getRequest();
    const headerValue = request.headers['x-tenant-id'];
    if (headerValue) {
      const parsed = parseInt(headerValue, 10);
      if (!isNaN(parsed)) return parsed;
    }
    return request.user?.tenantId;
  },
);
