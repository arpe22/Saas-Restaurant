import { Transform } from "class-transformer";
import { IsString, MaxLength } from "class-validator";

export class UpdateOrderItemNoteDto {
  @IsString()
  @MaxLength(500)
  @Transform(({ value }: { value: string }) => value.trim())
  note!: string;
}
