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

export class CreateTableDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  @Transform(({ value }: { value: string }) => value.trim())
  name!: string;

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
