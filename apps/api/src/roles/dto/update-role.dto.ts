import { IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateRoleDto {
  @IsString()
  @MaxLength(80)
  @IsOptional()
  name?: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  description?: string;
}
