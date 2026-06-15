import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import type { AuthenticatedUser } from "../auth/types/auth.types";
import { CreateTableDto } from "./dto/create-table.dto";
import { UpdateTableStatusDto } from "./dto/update-table-status.dto";
import { UpdateTableDto } from "./dto/update-table.dto";
import { TablesService } from "./tables.service";

@Controller("restaurants/:restaurantId/branches/:branchId/tables")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Post()
  @RequirePermissions("tables.manage")
  create(
    @Param("restaurantId") restaurantId: string,
    @Param("branchId") branchId: string,
    @Body() createTableDto: CreateTableDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.tablesService.create(
      restaurantId,
      branchId,
      createTableDto,
      user
    );
  }

  @Get()
  @RequirePermissions("tables.view")
  findAll(
    @Param("restaurantId") restaurantId: string,
    @Param("branchId") branchId: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.tablesService.findAll(restaurantId, branchId, user);
  }

  @Patch(":tableId")
  @RequirePermissions("tables.manage")
  update(
    @Param("restaurantId") restaurantId: string,
    @Param("branchId") branchId: string,
    @Param("tableId") tableId: string,
    @Body() updateTableDto: UpdateTableDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.tablesService.update(
      restaurantId,
      branchId,
      tableId,
      updateTableDto,
      user
    );
  }

  @Patch(":tableId/deactivate")
  @RequirePermissions("tables.manage")
  deactivate(
    @Param("restaurantId") restaurantId: string,
    @Param("branchId") branchId: string,
    @Param("tableId") tableId: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.tablesService.deactivate(
      restaurantId,
      branchId,
      tableId,
      user
    );
  }

  @Patch(":tableId/status")
  @RequirePermissions("tables.manage")
  updateStatus(
    @Param("restaurantId") restaurantId: string,
    @Param("branchId") branchId: string,
    @Param("tableId") tableId: string,
    @Body() updateTableStatusDto: UpdateTableStatusDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.tablesService.updateStatus(
      restaurantId,
      branchId,
      tableId,
      updateTableStatusDto,
      user
    );
  }
}
