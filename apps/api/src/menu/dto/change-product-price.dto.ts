import { Type } from "class-transformer";
import { IsNumber, Max, Min } from "class-validator";

export class ChangeProductPriceDto {
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(99999999.99)
  price!: number;
}
