import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { Prisma, TableStatus } from "@prisma/client";
import type { AuthenticatedUser } from "../auth/types/auth.types";
import { PrismaService } from "../database/prisma.service";
import { CreateTableDto } from "./dto/create-table.dto";
import { UpdateTableStatusDto } from "./dto/update-table-status.dto";
import { UpdateTableDto } from "./dto/update-table.dto";

const tableSelect = Prisma.validator<Prisma.TableSelect>()({
  branchId: true,
  capacity: true,
  createdAt: true,
  deletedAt: true,
  id: true,
  name: true,
  status: true,
  updatedAt: true
});

@Injectable()
export class TablesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    restaurantId: string,
    branchId: string,
    createTableDto: CreateTableDto,
    user: AuthenticatedUser
  ) {
    await this.findBranchOrThrow(restaurantId, branchId, user);

    try {
      return await this.prisma.table.create({
        data: {
          branchId,
          capacity: createTableDto.capacity,
          name: createTableDto.name.trim(),
          status: createTableDto.status ?? TableStatus.AVAILABLE
        },
        select: tableSelect
      });
    } catch (error) {
      this.handleTableError(error);
    }
  }

  async findAll(
    restaurantId: string,
    branchId: string,
    user: AuthenticatedUser
  ) {
    await this.findBranchOrThrow(restaurantId, branchId, user);

    return this.prisma.table.findMany({
      orderBy: {
        createdAt: "desc"
      },
      select: tableSelect,
      where: {
        branchId,
        deletedAt: null
      }
    });
  }

  async update(
    restaurantId: string,
    branchId: string,
    tableId: string,
    updateTableDto: UpdateTableDto,
    user: AuthenticatedUser
  ) {
    await this.findBranchOrThrow(restaurantId, branchId, user);
    await this.findTableOrThrow(branchId, tableId);

    try {
      return await this.prisma.table.update({
        data: {
          ...updateTableDto,
          name: updateTableDto.name?.trim()
        },
        select: tableSelect,
        where: {
          id: tableId
        }
      });
    } catch (error) {
      this.handleTableError(error);
    }
  }

  async deactivate(
    restaurantId: string,
    branchId: string,
    tableId: string,
    user: AuthenticatedUser
  ) {
    await this.findBranchOrThrow(restaurantId, branchId, user);
    await this.findTableOrThrow(branchId, tableId);

    return this.prisma.table.update({
      data: {
        deletedAt: new Date(),
        status: TableStatus.DISABLED
      },
      select: tableSelect,
      where: {
        id: tableId
      }
    });
  }

  async updateStatus(
    restaurantId: string,
    branchId: string,
    tableId: string,
    updateTableStatusDto: UpdateTableStatusDto,
    user: AuthenticatedUser
  ) {
    await this.findBranchOrThrow(restaurantId, branchId, user);
    await this.findTableOrThrow(branchId, tableId);

    return this.prisma.table.update({
      data: {
        status: updateTableStatusDto.status
      },
      select: tableSelect,
      where: {
        id: tableId
      }
    });
  }

  private async findBranchOrThrow(
    restaurantId: string,
    branchId: string,
    user: AuthenticatedUser
  ) {
    this.ensureSameRestaurant(restaurantId, user);
    this.ensureAllowedBranch(branchId, user);

    const branch = await this.prisma.branch.findFirst({
      select: {
        id: true
      },
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

  private async findTableOrThrow(branchId: string, tableId: string) {
    const table = await this.prisma.table.findFirst({
      select: tableSelect,
      where: {
        branchId,
        deletedAt: null,
        id: tableId
      }
    });

    if (!table) {
      throw new NotFoundException("Table not found");
    }

    return table;
  }

  private ensureSameRestaurant(
    restaurantId: string,
    user: AuthenticatedUser
  ): void {
    if (restaurantId !== user.restaurantId) {
      throw new ForbiddenException("Cannot access another restaurant");
    }
  }

  private ensureAllowedBranch(branchId: string, user: AuthenticatedUser): void {
    if (user.branchId && branchId !== user.branchId) {
      throw new ForbiddenException("Cannot access another branch");
    }
  }

  private handleTableError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new ConflictException("Table name already exists in this branch");
    }

    throw error;
  }
}
