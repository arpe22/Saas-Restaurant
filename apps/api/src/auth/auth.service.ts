import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { EntityStatus, Prisma } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../database/prisma.service";
import { LoginDto } from "./dto/login.dto";
import type {
  AuthenticatedUser,
  AuthTokenPayload,
  LoginResponse
} from "./types/auth.types";

const userForAuth = Prisma.validator<Prisma.UserDefaultArgs>()({
  include: {
    branch: {
      select: {
        deletedAt: true,
        id: true,
        status: true
      }
    },
    restaurant: {
      select: {
        deletedAt: true,
        id: true,
        status: true
      }
    },
    roles: {
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    }
  }
});

type UserForAuth = Prisma.UserGetPayload<typeof userForAuth>;
type RoleForAuth = UserForAuth["roles"][number]["role"];

@Injectable()
export class AuthService {
  private readonly accessTokenTtl: string;
  private readonly passwordSaltRounds = 12;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    configService: ConfigService
  ) {
    this.accessTokenTtl =
      configService.get<string>("JWT_ACCESS_TOKEN_TTL") ?? "15m";
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const email = loginDto.email.trim().toLowerCase();
    const candidates = await this.prisma.user.findMany({
      include: userForAuth.include,
      where: {
        email: {
          equals: email,
          mode: "insensitive"
        }
      }
    });

    const matchingUsers = await this.findMatchingUsers(
      candidates,
      loginDto.password
    );

    if (matchingUsers.length === 0) {
      throw new UnauthorizedException("Invalid email or password");
    }

    if (matchingUsers.length > 1) {
      throw new ConflictException("Multiple accounts match these credentials");
    }

    const user = matchingUsers[0];
    this.ensureUserCanLogin(user);

    const authenticatedUser = this.buildAuthenticatedUser(user);
    const payload: AuthTokenPayload = {
      sub: user.id,
      ...authenticatedUser
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      expiresIn: this.accessTokenTtl,
      tokenType: "Bearer",
      user: authenticatedUser
    };
  }

  hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.passwordSaltRounds);
  }

  private async findMatchingUsers(
    users: UserForAuth[],
    password: string
  ): Promise<UserForAuth[]> {
    const matchingUsers: UserForAuth[] = [];

    for (const user of users) {
      if (await bcrypt.compare(password, user.passwordHash)) {
        matchingUsers.push(user);
      }
    }

    return matchingUsers;
  }

  private ensureUserCanLogin(user: UserForAuth): void {
    const inactiveUser =
      user.deletedAt !== null || user.status !== EntityStatus.ACTIVE;
    const inactiveRestaurant =
      user.restaurant.deletedAt !== null ||
      user.restaurant.status !== EntityStatus.ACTIVE;
    const inactiveBranch =
      user.branch !== null &&
      (user.branch.deletedAt !== null ||
        user.branch.status !== EntityStatus.ACTIVE);

    if (inactiveUser || inactiveRestaurant || inactiveBranch) {
      throw new ForbiddenException("Account is not active");
    }
  }

  private buildAuthenticatedUser(user: UserForAuth): AuthenticatedUser {
    const roles = new Set<string>();
    const permissions = new Set<string>();

    for (const userRole of user.roles) {
      const role = userRole.role;

      if (!this.isUsableRole(role, user.restaurantId)) {
        continue;
      }

      roles.add(role.name);

      for (const rolePermission of role.permissions) {
        if (rolePermission.permission.deletedAt === null) {
          permissions.add(rolePermission.permission.key);
        }
      }
    }

    return {
      branchId: user.branchId,
      email: user.email,
      permissions: [...permissions].sort(),
      restaurantId: user.restaurantId,
      roles: [...roles].sort(),
      userId: user.id
    };
  }

  private isUsableRole(role: RoleForAuth, restaurantId: string): boolean {
    const belongsToUserRestaurant = role.restaurantId === restaurantId;
    const isGlobalRole = role.restaurantId === null;

    return (
      role.deletedAt === null &&
      role.status === EntityStatus.ACTIVE &&
      (belongsToUserRestaurant || isGlobalRole)
    );
  }
}
