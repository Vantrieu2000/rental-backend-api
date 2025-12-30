import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserPayload } from '../interfaces';

/**
 * Custom decorator to extract current user from request
 * Usage: @CurrentUser() user: UserPayload
 *
 * The user object is attached to the request by the JWT strategy
 * after successful authentication
 */
export const CurrentUser = createParamDecorator(
  (data: keyof UserPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as UserPayload;

    // If a specific property is requested, return only that property
    return data ? user?.[data] : user;
  },
);
