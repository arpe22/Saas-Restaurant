import {
  ConflictException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { EntityStatus, Prisma } from "@prisma/client";
import { AuthService } from "../auth/auth.service";
import type { AuthenticatedUser } from "../auth/types/auth.types";
import { PrismaService } from "../database/prisma.service";
import { AssignUserBranchDto } from "./dto/assign-user-branch.dto";
import { ChangeUserPasswordDto } from "./dto/change-user-password.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

const userResponseSelect = Prisma.validator<Prisma.UserSelect>()({
  branch: {
    select: {
      id: true,
      name: true,
      slug: true,
      status: true
    }
  },
  branchId: true,
  createdAt: true,
  deletedAt: true,
  email: true,
  firstName: true,
  id: true,
  lastName: true,
  restaurantId: true,
  roles: {
    select: {
      role: {
        select: {
          description: true,
          id: true,
          name: true,
          status: true
        }
      }
    }
  },
  status: true,
  updatedAt: true
});

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService
  ) {}

  async create(createUserDto: CreateUserDto, currentUser: AuthenticatedUser) {
    await this.ensureEmailAvailable(createUserDto.email);

    if (createUserDto.branchId) {
      await this.findBranchOrThrow(createUserDto.branchId, currentUser);
    }

    try {
      return await this.prisma.user.create({
        data: {
          branchId: createUserDto.branchId,
          email: createUserDto.email,
          firstName: createUserDto.firstName?.trim(),
          lastName: createUserDto.lastName?.trim(),
          passwordHash: await this.authService.hashPassword(
            createUserDto.password
          ),
          restaurantId: currentUser.restaurantId,
          status: EntityStatus.ACTIVE
        },
        select: userResponseSelect
      });
    } catch (error) {
      this.handleUserError(error);
    }
  }

  findAll(currentUser: AuthenticatedUser) {
    return this.prisma.user.findMany({
      orderBy: {
        createdAt: "desc"
      },
      select: userResponseSelect,
      where: {
        deletedAt: null,
        restaurantId: currentUser.restaurantId
      }
    });
  }

  async findOne(userId: string, currentUser: AuthenticatedUser) {
    return this.findUserOrThrow(userId, currentUser);
  }

  async update(
    userId: string,
    updateUserDto: UpdateUserDto,
    currentUser: AuthenticatedUser
  ) {
    await this.findUserOrThrow(userId, currentUser);

    if (updateUserDto.email) {
      await this.ensureEmailAvailable(updateUserDto.email, userId);
    }

    try {
      return await this.prisma.user.update({
        data: {
          ...updateUserDto,
          firstName: updateUserDto.firstName?.trim(),
          lastName: updateUserDto.lastName?.trim()
        },
        select: userResponseSelect,
        where: {
          id: userId
        }
      });
    } catch (error) {
      this.handleUserError(error);
    }
  }

  async deactivate(userId: string, currentUser: AuthenticatedUser) {
    await this.findUserOrThrow(userId, currentUser);

    return this.prisma.user.update({
      data: {
        deletedAt: new Date(),
        status: EntityStatus.INACTIVE
      },
      select: userResponseSelect,
      where: {
        id: userId
      }
    });
  }

  async assignBranch(
    userId: string,
    assignUserBranchDto: AssignUserBranchDto,
    currentUser: AuthenticatedUser
  ) {
    await this.findUserOrThrow(userId, currentUser);
    const branch = await this.findBranchOrThrow(
      assignUserBranchDto.branchId,
      currentUser
    );

    return this.prisma.user.update({
      data: {
        branchId: branch.id
      },
      select: userResponseSelect,
      where: {
        id: userId
      }
    });
  }

  async changePassword(
    userId: string,
    changeUserPasswordDto: ChangeUserPasswordDto,
    currentUser: AuthenticatedUser
  ) {
    await this.findUserOrThrow(userId, currentUser);

    return this.prisma.user.update({
      data: {
        passwordHash: await this.authService.hashPassword(
          changeUserPasswordDto.password
        )
      },
      select: userResponseSelect,
      where: {
        id: userId
      }
    });
  }

  async block(userId: string, currentUser: AuthenticatedUser) {
    await this.findUserOrThrow(userId, currentUser);

    return this.prisma.user.update({
      data: {
        status: EntityStatus.BLOCKED
      },
      select: userResponseSelect,
      where: {
        id: userId
      }
    });
  }

  private async findUserOrThrow(
    userId: string,
    currentUser: AuthenticatedUser
  ) {
    const user = await this.prisma.user.findFirst({
      select: userResponseSelect,
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

  private async findBranchOrThrow(
    branchId: string,
    currentUser: AuthenticatedUser
  ) {
    const branch = await this.prisma.branch.findFirst({
      select: {
        id: true
      },
      where: {
        deletedAt: null,
        id: branchId,
        restaurantId: currentUser.restaurantId
      }
    });

    if (!branch) {
      throw new NotFoundException("Branch not found");
    }

    return branch;
  }

  private async ensureEmailAvailable(
    email: string,
    ignoredUserId?: string
  ): Promise<void> {
    const existingUser = await this.prisma.user.findFirst({
      select: {
        id: true
      },
      where: {
        email: {
          equals: email,
          mode: "insensitive"
        },
        id: ignoredUserId
          ? {
              not: ignoredUserId
            }
          : undefined
      }
    });

    if (existingUser) {
      throw new ConflictException("Email already exists");
    }
  }

  private handleUserError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new ConflictException("Email already exists");
    }

    throw error;
  }
}
