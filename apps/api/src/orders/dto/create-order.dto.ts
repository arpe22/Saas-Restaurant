import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  tableId?: string;
}
