import { Type } from "class-transformer";
import { IsInt, Max, Min } from "class-validator";

export class UpdateOrderItemQuantityDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(999)
  quantity!: number;
}
