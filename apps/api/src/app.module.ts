import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AuthModule } from "./auth/auth.module";
import { BranchesModule } from "./branches/branches.module";
import { DatabaseModule } from "./database/database.module";
import { MenuModule } from "./menu/menu.module";
import { OrdersModule } from "./orders/orders.module";
import { RolesModule } from "./roles/roles.module";
import { RestaurantsModule } from "./restaurants/restaurants.module";
import { TablesModule } from "./tables/tables.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ["../../.env", ".env"]
    }),
    AuthModule,
    BranchesModule,
    DatabaseModule,
    MenuModule,
    OrdersModule,
    RolesModule,
    RestaurantsModule,
    TablesModule,
    UsersModule
  ],
  controllers: [AppController]
})
export class AppModule {}
