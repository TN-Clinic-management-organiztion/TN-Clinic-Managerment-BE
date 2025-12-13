import { SetMetadata } from '@nestjs/common';
// Decorator này đánh dấu route là public, không cần xác thực.
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);