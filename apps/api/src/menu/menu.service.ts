import {
  ConflictException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { EntityStatus, Prisma } from "@prisma/client";
import type { AuthenticatedUser } from "../auth/types/auth.types";
import { PrismaService } from "../database/prisma.service";
import { ChangeProductPriceDto } from "./dto/change-product-price.dto";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { UpdateProductAvailabilityDto } from "./dto/update-product-availability.dto";
import { UpdateProductDto } from "./dto/update-product.dto";

const categorySelect = Prisma.validator<Prisma.CategorySelect>()({
  createdAt: true,
  deletedAt: true,
  description: true,
  id: true,
  imageUrl: true,
  name: true,
  restaurantId: true,
  status: true,
  updatedAt: true
});

const productSelect = Prisma.validator<Prisma.ProductSelect>()({
  category: {
    select: {
      id: true,
      name: true,
      status: true
    }
  },
  categoryId: true,
  createdAt: true,
  deletedAt: true,
  description: true,
  id: true,
  imageUrl: true,
  isAvailable: true,
  name: true,
  price: true,
  restaurantId: true,
  status: true,
  updatedAt: true
});

@Injectable()
export class MenuService {
  constructor(private readonly prisma: PrismaService) {}

  async createCategory(
    createCategoryDto: CreateCategoryDto,
    user: AuthenticatedUser
  ) {
    try {
      return await this.prisma.category.create({
        data: {
          description: createCategoryDto.description?.trim(),
          imageUrl: createCategoryDto.imageUrl?.trim(),
          name: createCategoryDto.name.trim(),
          restaurantId: user.restaurantId,
          status: createCategoryDto.status ?? EntityStatus.ACTIVE
        },
        select: categorySelect
      });
    } catch (error) {
      this.handleCategoryError(error);
    }
  }

  findCategories(user: AuthenticatedUser) {
    return this.prisma.category.findMany({
      orderBy: {
        createdAt: "desc"
      },
      select: categorySelect,
      where: {
        deletedAt: null,
        restaurantId: user.restaurantId
      }
    });
  }

  async updateCategory(
    categoryId: string,
    updateCategoryDto: UpdateCategoryDto,
    user: AuthenticatedUser
  ) {
    await this.findCategoryOrThrow(categoryId, user);

    try {
      return await this.prisma.category.update({
        data: {
          ...updateCategoryDto,
          description: updateCategoryDto.description?.trim(),
          imageUrl: updateCategoryDto.imageUrl?.trim(),
          name: updateCategoryDto.name?.trim()
        },
        select: categorySelect,
        where: {
          id: categoryId
        }
      });
    } catch (error) {
      this.handleCategoryError(error);
    }
  }

  async deactivateCategory(categoryId: string, user: AuthenticatedUser) {
    await this.findCategoryOrThrow(categoryId, user);

    return this.prisma.category.update({
      data: {
        deletedAt: new Date(),
        status: EntityStatus.INACTIVE
      },
      select: categorySelect,
      where: {
        id: categoryId
      }
    });
  }

  async createProduct(createProductDto: CreateProductDto, user: AuthenticatedUser) {
    if (createProductDto.categoryId) {
      await this.findCategoryOrThrow(createProductDto.categoryId, user);
    }

    return this.prisma.product.create({
      data: {
        categoryId: createProductDto.categoryId,
        description: createProductDto.description?.trim(),
        imageUrl: createProductDto.imageUrl?.trim(),
        isAvailable: createProductDto.isAvailable ?? true,
        name: createProductDto.name.trim(),
        price: new Prisma.Decimal(createProductDto.price),
        restaurantId: user.restaurantId,
        status: createProductDto.status ?? EntityStatus.ACTIVE
      },
      select: productSelect
    });
  }

  findProducts(user: AuthenticatedUser) {
    return this.prisma.product.findMany({
      orderBy: {
        createdAt: "desc"
      },
      select: productSelect,
      where: {
        deletedAt: null,
        restaurantId: user.restaurantId
      }
    });
  }

  async findProductsByCategory(categoryId: string, user: AuthenticatedUser) {
    await this.findCategoryOrThrow(categoryId, user);

    return this.prisma.product.findMany({
      orderBy: {
        createdAt: "desc"
      },
      select: productSelect,
      where: {
        categoryId,
        deletedAt: null,
        restaurantId: user.restaurantId
      }
    });
  }

  async updateProduct(
    productId: string,
    updateProductDto: UpdateProductDto,
    user: AuthenticatedUser
  ) {
    await this.findProductOrThrow(productId, user);

    if (updateProductDto.categoryId) {
      await this.findCategoryOrThrow(updateProductDto.categoryId, user);
    }

    return this.prisma.product.update({
      data: {
        ...updateProductDto,
        description: updateProductDto.description?.trim(),
        imageUrl: updateProductDto.imageUrl?.trim(),
        name: updateProductDto.name?.trim()
      },
      select: productSelect,
      where: {
        id: productId
      }
    });
  }

  async changeProductPrice(
    productId: string,
    changeProductPriceDto: ChangeProductPriceDto,
    user: AuthenticatedUser
  ) {
    await this.findProductOrThrow(productId, user);

    return this.prisma.product.update({
      data: {
        price: new Prisma.Decimal(changeProductPriceDto.price)
      },
      select: productSelect,
      where: {
        id: productId
      }
    });
  }

  async activateProduct(productId: string, user: AuthenticatedUser) {
    await this.findProductOrThrow(productId, user);

    return this.prisma.product.update({
      data: {
        status: EntityStatus.ACTIVE
      },
      select: productSelect,
      where: {
        id: productId
      }
    });
  }

  async deactivateProduct(productId: string, user: AuthenticatedUser) {
    await this.findProductOrThrow(productId, user);

    return this.prisma.product.update({
      data: {
        status: EntityStatus.INACTIVE
      },
      select: productSelect,
      where: {
        id: productId
      }
    });
  }

  async updateProductAvailability(
    productId: string,
    updateProductAvailabilityDto: UpdateProductAvailabilityDto,
    user: AuthenticatedUser
  ) {
    await this.findProductOrThrow(productId, user);

    return this.prisma.product.update({
      data: {
        isAvailable: updateProductAvailabilityDto.isAvailable
      },
      select: productSelect,
      where: {
        id: productId
      }
    });
  }

  private async findCategoryOrThrow(
    categoryId: string,
    user: AuthenticatedUser
  ) {
    const category = await this.prisma.category.findFirst({
      select: categorySelect,
      where: {
        deletedAt: null,
        id: categoryId,
        restaurantId: user.restaurantId
      }
    });

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    return category;
  }

  private async findProductOrThrow(productId: string, user: AuthenticatedUser) {
    const product = await this.prisma.product.findFirst({
      select: productSelect,
      where: {
        deletedAt: null,
        id: productId,
        restaurantId: user.restaurantId
      }
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    return product;
  }

  private handleCategoryError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new ConflictException(
        "Category name already exists in this restaurant"
      );
    }

    throw error;
  }
}
