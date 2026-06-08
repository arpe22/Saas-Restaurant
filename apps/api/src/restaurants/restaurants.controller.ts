import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import type { AuthenticatedUser } from "../auth/types/auth.types";
import { CreateRestaurantDto } from "./dto/create-restaurant.dto";
import { UpdateRestaurantDto } from "./dto/update-restaurant.dto";
import { RestaurantsService } from "./restaurants.service";

@Controller("restaurants")
@UseGuards(JwtAuthGuard)
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Post()
  @RequirePermissions("restaurants.manage")
  @UseGuards(PermissionsGuard)
  create(@Body() createRestaurantDto: CreateRestaurantDto) {
    return this.restaurantsService.create(createRestaurantDto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.restaurantsService.findAll(user);
  }

  @Get(":restaurantId")
  findOne(
    @Param("restaurantId") restaurantId: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.restaurantsService.findOne(restaurantId, user);
  }

  @Patch(":restaurantId")
  @RequirePermissions("restaurants.manage")
  @UseGuards(PermissionsGuard)
  update(
    @Param("restaurantId") restaurantId: string,
    @Body() updateRestaurantDto: UpdateRestaurantDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.restaurantsService.update(
      restaurantId,
      updateRestaurantDto,
      user
    );
  }

  @Patch(":restaurantId/deactivate")
  @RequirePermissions("restaurants.manage")
  @UseGuards(PermissionsGuard)
  deactivate(
    @Param("restaurantId") restaurantId: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.restaurantsService.deactivate(restaurantId, user);
  }
}
