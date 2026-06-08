import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { EntityStatus, Prisma } from "@prisma/client";
import type { AuthenticatedUser } from "../auth/types/auth.types";
import { PrismaService } from "../database/prisma.service";
import { CreateBranchDto } from "./dto/create-branch.dto";
import { UpdateBranchDto } from "./dto/update-branch.dto";

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    restaurantId: string,
    createBranchDto: CreateBranchDto,
    user: AuthenticatedUser
  ) {
    this.ensureSameRestaurant(restaurantId, user);
    await this.ensureRestaurantExists(restaurantId);

    try {
      return await this.prisma.branch.create({
        data: {
          name: createBranchDto.name,
          restaurantId,
          slug: createBranchDto.slug,
          status: createBranchDto.status ?? EntityStatus.ACTIVE
        }
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  findAll(restaurantId: string, user: AuthenticatedUser) {
    this.ensureSameRestaurant(restaurantId, user);

    return this.prisma.branch.findMany({
      orderBy: {
        createdAt: "desc"
      },
      where: {
        deletedAt: null,
        restaurantId
      }
    });
  }

  async findOne(
    restaurantId: string,
    branchId: string,
    user: AuthenticatedUser
  ) {
    this.ensureSameRestaurant(restaurantId, user);

    return this.findBranchOrThrow(restaurantId, branchId);
  }

  async update(
    restaurantId: string,
    branchId: string,
    updateBranchDto: UpdateBranchDto,
    user: AuthenticatedUser
  ) {
    this.ensureSameRestaurant(restaurantId, user);
    await this.findBranchOrThrow(restaurantId, branchId);

    try {
      return await this.prisma.branch.update({
        data: {
          ...updateBranchDto
        },
        where: {
          id: branchId
        }
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async deactivate(
    restaurantId: string,
    branchId: string,
    user: AuthenticatedUser
  ) {
    this.ensureSameRestaurant(restaurantId, user);
    await this.findBranchOrThrow(restaurantId, branchId);

    return this.prisma.branch.update({
      data: {
        deletedAt: new Date(),
        status: EntityStatus.INACTIVE
      },
      where: {
        id: branchId
      }
    });
  }

  private ensureSameRestaurant(
    restaurantId: string,
    user: AuthenticatedUser
  ): void {
    if (restaurantId !== user.restaurantId) {
      throw new ForbiddenException("Cannot access another restaurant");
    }
  }

  private async ensureRestaurantExists(restaurantId: string): Promise<void> {
    const restaurant = await this.prisma.restaurant.findFirst({
      select: {
        id: true
      },
      where: {
        deletedAt: null,
        id: restaurantId
      }
    });

    if (!restaurant) {
      throw new NotFoundException("Restaurant not found");
    }
  }

  private async findBranchOrThrow(restaurantId: string, branchId: string) {
    const branch = await this.prisma.branch.findFirst({
      where: {
        deletedAt: null,
        id: branchId,
        restaurantId
      }
    });

    if (!branch) {
      throw new NotFoundException("Branch not found");
    }

    return branch;
  }

  private handlePrismaError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new ConflictException("Branch slug already exists");
    }

    throw error;
  }
}
