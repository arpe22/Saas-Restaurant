import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import type { AuthenticatedUser } from "../auth/types/auth.types";
import { AssignUserBranchDto } from "./dto/assign-user-branch.dto";
import { ChangeUserPasswordDto } from "./dto/change-user-password.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UsersService } from "./users.service";

@Controller("users")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions("users.manage")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.usersService.create(createUserDto, user);
  }

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.findAll(user);
  }

  @Get(":userId")
  findOne(
    @Param("userId") userId: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.usersService.findOne(userId, user);
  }

  @Patch(":userId")
  update(
    @Param("userId") userId: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.usersService.update(userId, updateUserDto, user);
  }

  @Patch(":userId/deactivate")
  deactivate(
    @Param("userId") userId: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.usersService.deactivate(userId, user);
  }

  @Patch(":userId/branch")
  assignBranch(
    @Param("userId") userId: string,
    @Body() assignUserBranchDto: AssignUserBranchDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.usersService.assignBranch(userId, assignUserBranchDto, user);
  }

  @Patch(":userId/password")
  changePassword(
    @Param("userId") userId: string,
    @Body() changeUserPasswordDto: ChangeUserPasswordDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.usersService.changePassword(
      userId,
      changeUserPasswordDto,
      user
    );
  }

  @Patch(":userId/block")
  block(
    @Param("userId") userId: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.usersService.block(userId, user);
  }
}
