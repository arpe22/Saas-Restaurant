import { ArrayMinSize, IsArray, IsString } from "class-validator";

export class AssignRolePermissionsDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  permissionKeys!: string[];
}
