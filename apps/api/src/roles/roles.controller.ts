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
import { AssignRolePermissionsDto } from "./dto/assign-role-permissions.dto";
import { AssignUserRoleDto } from "./dto/assign-user-role.dto";
import { CreateRoleDto } from "./dto/create-role.dto";
import { RemoveRolePermissionsDto } from "./dto/remove-role-permissions.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { RolesService } from "./roles.service";

@Controller()
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post("roles")
  @RequirePermissions("roles.manage")
  create(
    @Body() createRoleDto: CreateRoleDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.rolesService.create(createRoleDto, user);
  }

  @Get("roles")
  @RequirePermissions("roles.manage")
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.rolesService.findAllCurrentRestaurant(user);
  }

  @Patch("roles/:roleId")
  @RequirePermissions("roles.manage")
  update(
    @Param("roleId") roleId: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.rolesService.update(roleId, updateRoleDto, user);
  }

  @Patch("roles/:roleId/deactivate")
  @RequirePermissions("roles.manage")
  deactivate(
    @Param("roleId") roleId: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.rolesService.deactivate(roleId, user);
  }

  @Post("roles/:roleId/permissions")
  @RequirePermissions("roles.manage")
  assignPermissions(
    @Param("roleId") roleId: string,
    @Body() assignRolePermissionsDto: AssignRolePermissionsDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.rolesService.assignPermissions(
      roleId,
      assignRolePermissionsDto,
      user
    );
  }

  @Delete("roles/:roleId/permissions")
  @RequirePermissions("roles.manage")
  removePermissions(
    @Param("roleId") roleId: string,
    @Body() removeRolePermissionsDto: RemoveRolePermissionsDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.rolesService.removePermissions(
      roleId,
      removeRolePermissionsDto,
      user
    );
  }

  @Post("users/:userId/roles")
  @RequirePermissions("roles.manage")
  assignRoleToUser(
    @Param("userId") userId: string,
    @Body() assignUserRoleDto: AssignUserRoleDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.rolesService.assignRoleToUser(userId, assignUserRoleDto, user);
  }

  @Delete("users/:userId/roles/:roleId")
  @RequirePermissions("roles.manage")
  removeRoleFromUser(
    @Param("userId") userId: string,
    @Param("roleId") roleId: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.rolesService.removeRoleFromUser(userId, roleId, user);
  }
}
