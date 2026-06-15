import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { DatabaseModule } from "../database/database.module";
import { TablesController } from "./tables.controller";
import { TablesService } from "./tables.service";

@Module({
  controllers: [TablesController],
  imports: [AuthModule, DatabaseModule],
  providers: [TablesService]
})
export class TablesModule {}
