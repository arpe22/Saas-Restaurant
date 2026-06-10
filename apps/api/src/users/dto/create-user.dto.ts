import { Transform } from "class-transformer";
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength
} from "class-validator";

export class CreateUserDto {
  @IsEmail()
  @MaxLength(255)
  @Transform(({ value }: { value: string }) => value.trim().toLowerCase())
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  @IsString()
  @MaxLength(80)
  @IsOptional()
  firstName?: string;

  @IsString()
  @MaxLength(80)
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  branchId?: string;
}
