import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@domain/entities/user.entity';

export const CurrentUser = createParamDecorator(
  <K extends keyof User | undefined>(
    data: K,
    ctx: ExecutionContext,
  ): K extends keyof User ? User[K] : User => {
    const request = ctx.switchToHttp().getRequest<{ user: User }>();
    const user = request.user;

    // If a specific property is requested, return only that property
    // Otherwise, return the entire user object
    return (data ? user[data] : user) as K extends keyof User ? User[K] : User;
  },
);
