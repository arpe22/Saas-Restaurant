import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import type { AuthenticatedUser } from "../auth/types/auth.types";
import { ChangeProductPriceDto } from "./dto/change-product-price.dto";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { UpdateProductAvailabilityDto } from "./dto/update-product-availability.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { MenuService } from "./menu.service";

@Controller("menu")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post("categories")
  @RequirePermissions("menu.create")
  createCategory(
    @Body() createCategoryDto: CreateCategoryDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.menuService.createCategory(createCategoryDto, user);
  }

  @Get("categories")
  @RequirePermissions("menu.view")
  findCategories(@CurrentUser() user: AuthenticatedUser) {
    return this.menuService.findCategories(user);
  }

  @Patch("categories/:categoryId")
  @RequirePermissions("menu.update")
  updateCategory(
    @Param("categoryId") categoryId: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.menuService.updateCategory(categoryId, updateCategoryDto, user);
  }

  @Patch("categories/:categoryId/deactivate")
  @RequirePermissions("menu.delete")
  deactivateCategory(
    @Param("categoryId") categoryId: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.menuService.deactivateCategory(categoryId, user);
  }

  @Post("products")
  @RequirePermissions("menu.create")
  createProduct(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.menuService.createProduct(createProductDto, user);
  }

  @Get("products")
  @RequirePermissions("menu.view")
  findProducts(@CurrentUser() user: AuthenticatedUser) {
    return this.menuService.findProducts(user);
  }

  @Get("categories/:categoryId/products")
  @RequirePermissions("menu.view")
  findProductsByCategory(
    @Param("categoryId") categoryId: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.menuService.findProductsByCategory(categoryId, user);
  }

  @Patch("products/:productId")
  @RequirePermissions("menu.update")
  updateProduct(
    @Param("productId") productId: string,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.menuService.updateProduct(productId, updateProductDto, user);
  }

  @Patch("products/:productId/price")
  @RequirePermissions("menu.update")
  changeProductPrice(
    @Param("productId") productId: string,
    @Body() changeProductPriceDto: ChangeProductPriceDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.menuService.changeProductPrice(
      productId,
      changeProductPriceDto,
      user
    );
  }

  @Patch("products/:productId/activate")
  @RequirePermissions("menu.update")
  activateProduct(
    @Param("productId") productId: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.menuService.activateProduct(productId, user);
  }

  @Patch("products/:productId/deactivate")
  @RequirePermissions("menu.delete")
  deactivateProduct(
    @Param("productId") productId: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.menuService.deactivateProduct(productId, user);
  }

  @Patch("products/:productId/availability")
  @RequirePermissions("menu.update")
  updateProductAvailability(
    @Param("productId") productId: string,
    @Body() updateProductAvailabilityDto: UpdateProductAvailabilityDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.menuService.updateProductAvailability(
      productId,
      updateProductAvailabilityDto,
      user
    );
  }
}
