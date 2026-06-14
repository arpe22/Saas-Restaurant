import { EntityStatus } from "@prisma/client";
import { Transform } from "class-transformer";
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength
} from "class-validator";

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  @Transform(({ value }: { value?: string }) =>
    typeof value === "string" ? value.trim() : value
  )
  @IsOptional()
  name?: string;

  @IsString()
  @MaxLength(1000)
  @IsOptional()
  description?: string;

  @IsUrl({ require_tld: false })
  @MaxLength(2048)
  @IsOptional()
  imageUrl?: string;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @IsEnum(EntityStatus)
  @IsOptional()
  status?: EntityStatus;
}
