import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import type { JwtModuleOptions } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { PermissionsGuard } from "./guards/permissions.guard";
import { DatabaseModule } from "../database/database.module";

type JwtExpiresIn = NonNullable<JwtModuleOptions["signOptions"]>["expiresIn"];

@Module({
  imports: [
    DatabaseModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        const secret = configService.get<string>("JWT_SECRET");

        if (!secret) {
          throw new Error("JWT_SECRET is required");
        }

        const expiresIn = (configService.get<string>("JWT_ACCESS_TOKEN_TTL") ??
          "15m") as JwtExpiresIn;

        return {
          secret,
          signOptions: {
            expiresIn
          }
        };
      }
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, PermissionsGuard],
  exports: [AuthService, JwtAuthGuard, JwtModule, PermissionsGuard]
})
export class AuthModule {}
