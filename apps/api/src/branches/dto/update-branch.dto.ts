import { Transform } from "class-transformer";
import { IsEnum, IsOptional, IsString, Matches, MaxLength } from "class-validator";
import { EntityStatus } from "@prisma/client";

export class UpdateBranchDto {
  @IsString()
  @MaxLength(120)
  @IsOptional()
  name?: string;

  @IsString()
  @MaxLength(80)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  @Transform(({ value }: { value?: string }) =>
    typeof value === "string" ? value.trim().toLowerCase() : value
  )
  @IsOptional()
  slug?: string;

  @IsEnum(EntityStatus)
  @IsOptional()
  status?: EntityStatus;
}
