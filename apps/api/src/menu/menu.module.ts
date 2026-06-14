import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { DatabaseModule } from "../database/database.module";
import { MenuController } from "./menu.controller";
import { MenuService } from "./menu.service";

@Module({
  controllers: [MenuController],
  imports: [AuthModule, DatabaseModule],
  providers: [MenuService]
})
export class MenuModule {}
