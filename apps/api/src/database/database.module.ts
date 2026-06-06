import { Module } from "@nestjs/common";
import { DatabaseController } from "./database.controller";
import { PrismaService } from "./prisma.service";

@Module({
  controllers: [DatabaseController],
  providers: [PrismaService],
  exports: [PrismaService]
})
export class DatabaseModule {}
