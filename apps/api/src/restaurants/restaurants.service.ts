import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { EntityStatus, Prisma } from "@prisma/client";
import type { AuthenticatedUser } from "../auth/types/auth.types";
import { PrismaService } from "../database/prisma.service";
import { CreateRestaurantDto } from "./dto/create-restaurant.dto";
import { UpdateRestaurantDto } from "./dto/update-restaurant.dto";

@Injectable()
export class RestaurantsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createRestaurantDto: CreateRestaurantDto) {
    try {
      return await this.prisma.restaurant.create({
        data: {
          name: createRestaurantDto.name,
          slug: createRestaurantDto.slug,
          status: createRestaurantDto.status ?? EntityStatus.ACTIVE
        }
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  findAll(user: AuthenticatedUser) {
    const canManageRestaurants = user.permissions.includes("restaurants.manage");

    return this.prisma.restaurant.findMany({
      orderBy: {
        createdAt: "desc"
      },
      where: canManageRestaurants
        ? {
            deletedAt: null
          }
        : {
            deletedAt: null,
            id: user.restaurantId
          }
    });
  }

  async findOne(restaurantId: string, user: AuthenticatedUser) {
    this.ensureRestaurantAccess(restaurantId, user);

    const restaurant = await this.prisma.restaurant.findFirst({
      where: {
        deletedAt: null,
        id: restaurantId
      }
    });

    if (!restaurant) {
      throw new NotFoundException("Restaurant not found");
    }

    return restaurant;
  }

  async update(
    restaurantId: string,
    updateRestaurantDto: UpdateRestaurantDto,
    user: AuthenticatedUser
  ) {
    this.ensureRestaurantAccess(restaurantId, user);
    await this.ensureRestaurantExists(restaurantId);

    try {
      return await this.prisma.restaurant.update({
        data: {
          ...updateRestaurantDto
        },
        where: {
          id: restaurantId
        }
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async deactivate(restaurantId: string, user: AuthenticatedUser) {
    this.ensureRestaurantAccess(restaurantId, user);
    await this.ensureRestaurantExists(restaurantId);

    return this.prisma.restaurant.update({
      data: {
        deletedAt: new Date(),
        status: EntityStatus.INACTIVE
      },
      where: {
        id: restaurantId
      }
    });
  }

  private ensureRestaurantAccess(
    restaurantId: string,
    user: AuthenticatedUser
  ): void {
    const canManageRestaurants = user.permissions.includes("restaurants.manage");

    if (!canManageRestaurants && restaurantId !== user.restaurantId) {
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

  private handlePrismaError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new ConflictException("Restaurant slug already exists");
    }

    throw error;
  }
}
