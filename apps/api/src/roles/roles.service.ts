import {
  ConflictException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { EntityStatus, Prisma, RoleScope } from "@prisma/client";
import type { AuthenticatedUser } from "../auth/types/auth.types";
import { PrismaService } from "../database/prisma.service";
import { AssignRolePermissionsDto } from "./dto/assign-role-permissions.dto";
import { AssignUserRoleDto } from "./dto/assign-user-role.dto";
import { CreateRoleDto } from "./dto/create-role.dto";
import { RemoveRolePermissionsDto } from "./dto/remove-role-permissions.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto, user: AuthenticatedUser) {
    try {
      return await this.prisma.role.create({
        data: {
          description: createRoleDto.description,
          name: createRoleDto.name.trim(),
          restaurantId: user.restaurantId,
          scope: RoleScope.RESTAURANT,
          status: EntityStatus.ACTIVE
        }
      });
    } catch (error) {
      this.handleRoleError(error);
    }
  }

  findAllCurrentRestaurant(user: AuthenticatedUser) {
    return this.prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true
          },
          where: {
            permission: {
              deletedAt: null
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      where: {
        deletedAt: null,
        restaurantId: user.restaurantId,
        scope: RoleScope.RESTAURANT
      }
    });
  }

  async update(
    roleId: string,
    updateRoleDto: UpdateRoleDto,
    user: AuthenticatedUser
  ) {
    await this.findRoleOrThrow(roleId, user);

    try {
      return await this.prisma.role.update({
        data: {
          ...updateRoleDto,
          name: updateRoleDto.name?.trim()
        },
        where: {
          id: roleId
        }
      });
    } catch (error) {
      this.handleRoleError(error);
    }
  }

  async deactivate(roleId: string, user: AuthenticatedUser) {
    await this.findRoleOrThrow(roleId, user);

    return this.prisma.role.update({
      data: {
        deletedAt: new Date(),
        status: EntityStatus.INACTIVE
      },
      where: {
        id: roleId
      }
    });
  }

  async assignPermissions(
    roleId: string,
    assignRolePermissionsDto: AssignRolePermissionsDto,
    user: AuthenticatedUser
  ) {
    await this.findRoleOrThrow(roleId, user);
    const permissionIds = await this.resolvePermissionIds(
      assignRolePermissionsDto.permissionKeys
    );

    await this.prisma.rolePermission.createMany({
      data: permissionIds.map((permissionId) => ({
        permissionId,
        roleId
      })),
      skipDuplicates: true
    });

    return this.findRoleWithPermissionsOrThrow(roleId, user);
  }

  async removePermissions(
    roleId: string,
    removeRolePermissionsDto: RemoveRolePermissionsDto,
    user: AuthenticatedUser
  ) {
    await this.findRoleOrThrow(roleId, user);
    const permissionIds = await this.resolvePermissionIds(
      removeRolePermissionsDto.permissionKeys
    );

    await this.prisma.rolePermission.deleteMany({
      where: {
        permissionId: {
          in: permissionIds
        },
        roleId
      }
    });

    return this.findRoleWithPermissionsOrThrow(roleId, user);
  }

  async assignRoleToUser(
    userId: string,
    assignUserRoleDto: AssignUserRoleDto,
    currentUser: AuthenticatedUser
  ) {
    const user = await this.findUserOrThrow(userId, currentUser);
    await this.findRoleOrThrow(assignUserRoleDto.roleId, currentUser);

    try {
      await this.prisma.userRole.create({
        data: {
          roleId: assignUserRoleDto.roleId,
          userId: user.id
        }
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException("User already has this role");
      }

      throw error;
    }

    return this.findUserWithRolesOrThrow(user.id, currentUser);
  }

  async removeRoleFromUser(
    userId: string,
    roleId: string,
    currentUser: AuthenticatedUser
  ) {
    await this.findUserOrThrow(userId, currentUser);
    await this.findRoleOrThrow(roleId, currentUser);

    const deleted = await this.prisma.userRole.deleteMany({
      where: {
        roleId,
        userId
      }
    });

    if (deleted.count === 0) {
      throw new NotFoundException("User role assignment not found");
    }

    return this.findUserWithRolesOrThrow(userId, currentUser);
  }

  private async findRoleOrThrow(roleId: string, user: AuthenticatedUser) {
    const role = await this.prisma.role.findFirst({
      where: {
        deletedAt: null,
        id: roleId,
        restaurantId: user.restaurantId,
        scope: RoleScope.RESTAURANT
      }
    });

    if (!role) {
      throw new NotFoundException("Role not found");
    }

    return role;
  }

  private async findRoleWithPermissionsOrThrow(
    roleId: string,
    user: AuthenticatedUser
  ) {
    const role = await this.prisma.role.findFirst({
      include: {
        permissions: {
          include: {
            permission: true
          },
          where: {
            permission: {
              deletedAt: null
            }
          }
        }
      },
      where: {
        deletedAt: null,
        id: roleId,
        restaurantId: user.restaurantId,
        scope: RoleScope.RESTAURANT
      }
    });

    if (!role) {
      throw new NotFoundException("Role not found");
    }

    return role;
  }

  private async findUserOrThrow(userId: string, currentUser: AuthenticatedUser) {
    const user = await this.prisma.user.findFirst({
      where: {
        deletedAt: null,
        id: userId,
        restaurantId: currentUser.restaurantId
      }
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  private async findUserWithRolesOrThrow(
    userId: string,
    currentUser: AuthenticatedUser
  ) {
    const user = await this.prisma.user.findFirst({
      include: {
        roles: {
          include: {
            role: true
          },
          where: {
            role: {
              deletedAt: null,
              restaurantId: currentUser.restaurantId,
              scope: RoleScope.RESTAURANT
            }
          }
        }
      },
      where: {
        deletedAt: null,
        id: userId,
        restaurantId: currentUser.restaurantId
      }
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  private async resolvePermissionIds(permissionKeys: string[]) {
    const normalizedKeys = [...new Set(permissionKeys.map((key) => key.trim()))];
    const permissions = await this.prisma.permission.findMany({
      select: {
        id: true,
        key: true
      },
      where: {
        deletedAt: null,
        key: {
          in: normalizedKeys
        }
      }
    });

    if (permissions.length !== normalizedKeys.length) {
      const foundKeys = new Set(permissions.map((permission) => permission.key));
      const missingKeys = normalizedKeys.filter((key) => !foundKeys.has(key));
      throw new NotFoundException(
        `Permissions not found: ${missingKeys.join(", ")}`
      );
    }

    return permissions.map((permission) => permission.id);
  }

  private handleRoleError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new ConflictException("Role name already exists in this restaurant");
    }

    throw error;
  }
}
