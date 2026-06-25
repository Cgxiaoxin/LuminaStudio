import { IsString, IsOptional, IsEnum, IsInt } from 'class-validator';

export class UpdateStaffDto {
  @IsString()
  @IsOptional()
  displayName?: string;

  @IsEnum(['OWNER', 'ADMIN', 'STAFF', 'COACH'])
  @IsOptional()
  role?: string;

  @IsInt()
  @IsOptional()
  storeId?: number;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  password?: string;
}
