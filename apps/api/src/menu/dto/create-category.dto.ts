import { EntityStatus } from "@prisma/client";
import { Transform } from "class-transformer";
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength
} from "class-validator";

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  @Transform(({ value }: { value: string }) => value.trim())
  name!: string;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  description?: string;

  @IsUrl({ require_tld: false })
  @MaxLength(2048)
  @IsOptional()
  imageUrl?: string;

  @IsEnum(EntityStatus)
  @IsOptional()
  status?: EntityStatus;
}
