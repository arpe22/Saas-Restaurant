import { IsOptional, IsString, MaxLength } from "class-validator";

export class CreateRoleDto {
  @IsString()
  @MaxLength(80)
  name!: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  description?: string;
}
