import { Transform } from "class-transformer";
import { IsEnum, IsOptional, IsString, Matches, MaxLength } from "class-validator";
import { EntityStatus } from "@prisma/client";

export class CreateRestaurantDto {
  @IsString()
  @MaxLength(120)
  name!: string;

  @IsString()
  @MaxLength(80)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  @Transform(({ value }: { value: string }) => value.trim().toLowerCase())
  slug!: string;

  @IsEnum(EntityStatus)
  @IsOptional()
  status?: EntityStatus;
}
