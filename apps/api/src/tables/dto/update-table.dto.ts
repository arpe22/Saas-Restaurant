import { TableStatus } from "@prisma/client";
import { Transform, Type } from "class-transformer";
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min
} from "class-validator";

export class UpdateTableDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  @Transform(({ value }: { value?: string }) =>
    typeof value === "string" ? value.trim() : value
  )
  @IsOptional()
  name?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  @IsOptional()
  capacity?: number;

  @IsEnum(TableStatus)
  @IsOptional()
  status?: TableStatus;
}
