import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt } from 'class-validator';

export class CreateStaffDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  displayName: string;

  @IsEnum(['OWNER', 'ADMIN', 'STAFF', 'COACH'])
  role: string;

  @IsInt()
  @IsOptional()
  storeId?: number;
}
