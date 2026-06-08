import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import type { AuthenticatedUser } from "../auth/types/auth.types";
import { BranchesService } from "./branches.service";
import { CreateBranchDto } from "./dto/create-branch.dto";
import { UpdateBranchDto } from "./dto/update-branch.dto";

@Controller("restaurants/:restaurantId/branches")
@UseGuards(JwtAuthGuard)
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  @RequirePermissions("branches.manage")
  @UseGuards(PermissionsGuard)
  create(
    @Param("restaurantId") restaurantId: string,
    @Body() createBranchDto: CreateBranchDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.branchesService.create(restaurantId, createBranchDto, user);
  }

  @Get()
  findAll(
    @Param("restaurantId") restaurantId: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.branchesService.findAll(restaurantId, user);
  }

  @Get(":branchId")
  findOne(
    @Param("restaurantId") restaurantId: string,
    @Param("branchId") branchId: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.branchesService.findOne(restaurantId, branchId, user);
  }

  @Patch(":branchId")
  @RequirePermissions("branches.manage")
  @UseGuards(PermissionsGuard)
  update(
    @Param("restaurantId") restaurantId: string,
    @Param("branchId") branchId: string,
    @Body() updateBranchDto: UpdateBranchDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.branchesService.update(
      restaurantId,
      branchId,
      updateBranchDto,
      user
    );
  }

  @Patch(":branchId/deactivate")
  @RequirePermissions("branches.manage")
  @UseGuards(PermissionsGuard)
  deactivate(
    @Param("restaurantId") restaurantId: string,
    @Param("branchId") branchId: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.branchesService.deactivate(restaurantId, branchId, user);
  }
}
