import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { EntityStatus, OrderStatus, Prisma } from "@prisma/client";
import type { AuthenticatedUser } from "../auth/types/auth.types";
import { PrismaService } from "../database/prisma.service";
import { AddOrderItemDto } from "./dto/add-order-item.dto";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderItemNoteDto } from "./dto/update-order-item-note.dto";
import { UpdateOrderItemQuantityDto } from "./dto/update-order-item-quantity.dto";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";

const orderInclude = Prisma.validator<Prisma.OrderInclude>()({
  branch: {
    select: {
      id: true,
      name: true,
      slug: true
    }
  },
  items: {
    include: {
      product: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: {
      createdAt: "asc"
    }
  },
  table: {
    select: {
      id: true,
      name: true,
      status: true
    }
  },
  waiter: {
    select: {
      email: true,
      firstName: true,
      id: true,
      lastName: true
    }
  }
});

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.DRAFT]: [OrderStatus.CONFIRMED],
  [OrderStatus.CONFIRMED]: [OrderStatus.IN_KITCHEN],
  [OrderStatus.IN_KITCHEN]: [OrderStatus.PREPARING],
  [OrderStatus.PREPARING]: [OrderStatus.READY],
  [OrderStatus.READY]: [OrderStatus.SERVED],
  [OrderStatus.SERVED]: [OrderStatus.PAID],
  [OrderStatus.PAID]: [],
  [OrderStatus.CANCELLED]: []
};

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    restaurantId: string,
    branchId: string,
    createOrderDto: CreateOrderDto,
    user: AuthenticatedUser
  ) {
    await this.findBranchOrThrow(restaurantId, branchId, user);

    if (createOrderDto.tableId) {
      await this.findTableOrThrow(branchId, createOrderDto.tableId);
    }

    return this.prisma.order.create({
      data: {
        branchId,
        restaurantId,
        tableId: createOrderDto.tableId,
        waiterId: user.userId
      },
      include: orderInclude
    });
  }

  async findAllByBranch(
    restaurantId: string,
    branchId: string,
    user: AuthenticatedUser
  ) {
    await this.findBranchOrThrow(restaurantId, branchId, user);

    return this.prisma.order.findMany({
      include: orderInclude,
      orderBy: {
        createdAt: "desc"
      },
      where: {
        branchId,
        deletedAt: null,
        restaurantId
      }
    });
  }

  async findOne(
    restaurantId: string,
    branchId: string,
    orderId: string,
    user: AuthenticatedUser
  ) {
    return this.findOrderOrThrow(restaurantId, branchId, orderId, user);
  }

  async updateStatus(
    restaurantId: string,
    branchId: string,
    orderId: string,
    updateOrderStatusDto: UpdateOrderStatusDto,
    user: AuthenticatedUser
  ) {
    const order = await this.findOrderOrThrow(
      restaurantId,
      branchId,
      orderId,
      user
    );

    const nextStatus = updateOrderStatusDto.status;

    if (nextStatus === OrderStatus.CANCELLED) {
      throw new BadRequestException("Use the cancel endpoint to cancel orders");
    }

    this.ensureValidTransition(order.status, nextStatus);

    return this.prisma.order.update({
      data: {
        paidAt: nextStatus === OrderStatus.PAID ? new Date() : undefined,
        status: nextStatus
      },
      include: orderInclude,
      where: {
        id: order.id
      }
    });
  }

  async cancel(
    restaurantId: string,
    branchId: string,
    orderId: string,
    user: AuthenticatedUser
  ) {
    const order = await this.findOrderOrThrow(
      restaurantId,
      branchId,
      orderId,
      user
    );

    if (order.status === OrderStatus.PAID) {
      throw new BadRequestException("Paid orders cannot be cancelled");
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException("Order is already cancelled");
    }

    return this.prisma.order.update({
      data: {
        cancelledAt: new Date(),
        status: OrderStatus.CANCELLED
      },
      include: orderInclude,
      where: {
        id: order.id
      }
    });
  }

  async addItem(
    restaurantId: string,
    branchId: string,
    orderId: string,
    addOrderItemDto: AddOrderItemDto,
    user: AuthenticatedUser
  ) {
    const order = await this.findOrderOrThrow(
      restaurantId,
      branchId,
      orderId,
      user
    );
    this.ensureOrderCanBeEdited(order.status);
    const product = await this.findSellableProductOrThrow(
      restaurantId,
      addOrderItemDto.productId
    );

    return this.prisma.$transaction(async (tx) => {
      await tx.orderItem.create({
        data: {
          note: addOrderItemDto.note,
          orderId: order.id,
          productId: product.id,
          quantity: addOrderItemDto.quantity,
          unitPrice: product.price
        }
      });

      return this.recalculateOrderTotals(order.id, tx);
    });
  }

  async removeItem(
    restaurantId: string,
    branchId: string,
    orderId: string,
    itemId: string,
    user: AuthenticatedUser
  ) {
    const order = await this.findOrderOrThrow(
      restaurantId,
      branchId,
      orderId,
      user
    );
    this.ensureOrderCanBeEdited(order.status);
    await this.findOrderItemOrThrow(order.id, itemId);

    return this.prisma.$transaction(async (tx) => {
      await tx.orderItem.delete({
        where: {
          id: itemId
        }
      });

      return this.recalculateOrderTotals(order.id, tx);
    });
  }

  async updateItemQuantity(
    restaurantId: string,
    branchId: string,
    orderId: string,
    itemId: string,
    updateOrderItemQuantityDto: UpdateOrderItemQuantityDto,
    user: AuthenticatedUser
  ) {
    const order = await this.findOrderOrThrow(
      restaurantId,
      branchId,
      orderId,
      user
    );
    this.ensureOrderCanBeEdited(order.status);
    await this.findOrderItemOrThrow(order.id, itemId);

    return this.prisma.$transaction(async (tx) => {
      await tx.orderItem.update({
        data: {
          quantity: updateOrderItemQuantityDto.quantity
        },
        where: {
          id: itemId
        }
      });

      return this.recalculateOrderTotals(order.id, tx);
    });
  }

  async updateItemNote(
    restaurantId: string,
    branchId: string,
    orderId: string,
    itemId: string,
    updateOrderItemNoteDto: UpdateOrderItemNoteDto,
    user: AuthenticatedUser
  ) {
    const order = await this.findOrderOrThrow(
      restaurantId,
      branchId,
      orderId,
      user
    );
    this.ensureOrderCanBeEdited(order.status);
    await this.findOrderItemOrThrow(order.id, itemId);

    return this.prisma.orderItem.update({
      data: {
        note: updateOrderItemNoteDto.note
      },
      where: {
        id: itemId
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
      select: {
        id: true
      },
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

  private async findOrderOrThrow(
    restaurantId: string,
    branchId: string,
    orderId: string,
    user: AuthenticatedUser
  ) {
    await this.findBranchOrThrow(restaurantId, branchId, user);

    const order = await this.prisma.order.findFirst({
      include: orderInclude,
      where: {
        branchId,
        deletedAt: null,
        id: orderId,
        restaurantId
      }
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    return order;
  }

  private async findOrderItemOrThrow(orderId: string, itemId: string) {
    const item = await this.prisma.orderItem.findFirst({
      where: {
        id: itemId,
        orderId
      }
    });

    if (!item) {
      throw new NotFoundException("Order item not found");
    }

    return item;
  }

  private async findSellableProductOrThrow(
    restaurantId: string,
    productId: string
  ) {
    const product = await this.prisma.product.findFirst({
      select: {
        id: true,
        price: true
      },
      where: {
        deletedAt: null,
        id: productId,
        isAvailable: true,
        restaurantId,
        status: EntityStatus.ACTIVE
      }
    });

    if (!product) {
      throw new NotFoundException("Product not found or not available");
    }

    return product;
  }

  private async recalculateOrderTotals(
    orderId: string,
    tx: Prisma.TransactionClient
  ) {
    const items = await tx.orderItem.findMany({
      select: {
        quantity: true,
        unitPrice: true
      },
      where: {
        orderId
      }
    });

    const subtotal = items.reduce(
      (current, item) =>
        current.plus(new Prisma.Decimal(item.unitPrice).mul(item.quantity)),
      new Prisma.Decimal(0)
    );

    return tx.order.update({
      data: {
        subtotal,
        total: subtotal
      },
      include: orderInclude,
      where: {
        id: orderId
      }
    });
  }

  private ensureValidTransition(
    currentStatus: OrderStatus,
    nextStatus: OrderStatus
  ): void {
    if (currentStatus === nextStatus) {
      return;
    }

    if (!allowedTransitions[currentStatus].includes(nextStatus)) {
      throw new BadRequestException(
        `Invalid order status transition from ${currentStatus} to ${nextStatus}`
      );
    }
  }

  private ensureOrderCanBeEdited(status: OrderStatus): void {
    if (status === OrderStatus.PAID) {
      throw new BadRequestException("Paid orders cannot be edited");
    }

    if (status === OrderStatus.CANCELLED) {
      throw new BadRequestException("Cancelled orders cannot be edited");
    }
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
}
