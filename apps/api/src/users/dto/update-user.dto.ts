import { EntityStatus } from "@prisma/client";
import { Transform } from "class-transformer";
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength
} from "class-validator";

export class UpdateUserDto {
  @IsEmail()
  @MaxLength(255)
  @Transform(({ value }: { value?: string }) =>
    typeof value === "string" ? value.trim().toLowerCase() : value
  )
  @IsOptional()
  email?: string;

  @IsString()
  @MaxLength(80)
  @IsOptional()
  firstName?: string;

  @IsString()
  @MaxLength(80)
  @IsOptional()
  lastName?: string;

  @IsEnum(EntityStatus)
  @IsOptional()
  status?: EntityStatus;
}
