import { Transform, Type } from "class-transformer";
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min
} from "class-validator";

export class AddOrderItemDto {
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(999)
  quantity!: number;

  @IsString()
  @MaxLength(500)
  @Transform(({ value }: { value?: string }) =>
    typeof value === "string" ? value.trim() : value
  )
  @IsOptional()
  note?: string;
}
