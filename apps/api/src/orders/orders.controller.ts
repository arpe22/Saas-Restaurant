import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards
} from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import type { AuthenticatedUser } from "../auth/types/auth.types";
import { AddOrderItemDto } from "./dto/add-order-item.dto";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderItemNoteDto } from "./dto/update-order-item-note.dto";
import { UpdateOrderItemQuantityDto } from "./dto/update-order-item-quantity.dto";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { OrdersService } from "./orders.service";

@Controller("restaurants/:restaurantId/branches/:branchId/orders")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @RequirePermissions("orders.create")
  create(
    @Param("restaurantId") restaurantId: string,
    @Param("branchId") branchId: string,
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.ordersService.create(
      restaurantId,
      branchId,
      createOrderDto,
      user
    );
  }

  @Get()
  @RequirePermissions("orders.view")
  findAllByBranch(
    @Param("restaurantId") restaurantId: string,
    @Param("branchId") branchId: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.ordersService.findAllByBranch(restaurantId, branchId, user);
  }

  @Get(":orderId")
  @RequirePermissions("orders.view")
  findOne(
    @Param("restaurantId") restaurantId: string,
    @Param("branchId") branchId: string,
    @Param("orderId") orderId: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.ordersService.findOne(restaurantId, branchId, orderId, user);
  }

  @Patch(":orderId/status")
  @RequirePermissions("orders.update")
  updateStatus(
    @Param("restaurantId") restaurantId: string,
    @Param("branchId") branchId: string,
    @Param("orderId") orderId: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.ordersService.updateStatus(
      restaurantId,
      branchId,
      orderId,
      updateOrderStatusDto,
      user
    );
  }

  @Patch(":orderId/cancel")
  @RequirePermissions("orders.cancel")
  cancel(
    @Param("restaurantId") restaurantId: string,
    @Param("branchId") branchId: string,
    @Param("orderId") orderId: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.ordersService.cancel(restaurantId, branchId, orderId, user);
  }

  @Post(":orderId/items")
  @RequirePermissions("orders.update")
  addItem(
    @Param("restaurantId") restaurantId: string,
    @Param("branchId") branchId: string,
    @Param("orderId") orderId: string,
    @Body() addOrderItemDto: AddOrderItemDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.ordersService.addItem(
      restaurantId,
      branchId,
      orderId,
      addOrderItemDto,
      user
    );
  }

  @Delete(":orderId/items/:itemId")
  @RequirePermissions("orders.update")
  removeItem(
    @Param("restaurantId") restaurantId: string,
    @Param("branchId") branchId: string,
    @Param("orderId") orderId: string,
    @Param("itemId") itemId: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.ordersService.removeItem(
      restaurantId,
      branchId,
      orderId,
      itemId,
      user
    );
  }

  @Patch(":orderId/items/:itemId/quantity")
  @RequirePermissions("orders.update")
  updateItemQuantity(
    @Param("restaurantId") restaurantId: string,
    @Param("branchId") branchId: string,
    @Param("orderId") orderId: string,
    @Param("itemId") itemId: string,
    @Body() updateOrderItemQuantityDto: UpdateOrderItemQuantityDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.ordersService.updateItemQuantity(
      restaurantId,
      branchId,
      orderId,
      itemId,
      updateOrderItemQuantityDto,
      user
    );
  }

  @Patch(":orderId/items/:itemId/note")
  @RequirePermissions("orders.update")
  updateItemNote(
    @Param("restaurantId") restaurantId: string,
    @Param("branchId") branchId: string,
    @Param("orderId") orderId: string,
    @Param("itemId") itemId: string,
    @Body() updateOrderItemNoteDto: UpdateOrderItemNoteDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.ordersService.updateItemNote(
      restaurantId,
      branchId,
      orderId,
      itemId,
      updateOrderItemNoteDto,
      user
    );
  }
}
