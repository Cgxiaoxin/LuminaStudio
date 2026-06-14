import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsInt } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(['GROUP_CLASS', 'PRIVATE_SESSION', 'PACKAGE', 'PRODUCT'])
  type: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  price: number;

  @IsInt()
  durationMinutes: number;

  @IsInt()
  @IsOptional()
  storeId?: number;

  @IsInt()
  @IsOptional()
  coachId?: number;
}
