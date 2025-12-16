import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Decorator này lấy thông tin user từ request.
export const CurrentUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    if (!data) return request.user;
    return request.user[data];
  },
);
