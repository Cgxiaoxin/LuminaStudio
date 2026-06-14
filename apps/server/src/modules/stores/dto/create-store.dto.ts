import { IsString, IsNotEmpty, IsOptional, IsJSON } from 'class-validator';

export class CreateStoreDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsOptional()
  @IsJSON()
  businessHours?: any;
}
