import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException
} from "@nestjs/common";
import type { AuthenticatedRequest } from "../types/authenticated-request.type";
import type { AuthenticatedUser } from "../types/auth.types";

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.user) {
      throw new UnauthorizedException("Authenticated user not found");
    }

    return request.user;
  }
);
