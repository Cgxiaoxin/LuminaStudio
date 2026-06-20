import { IsString, IsNotEmpty, IsOptional, IsInt, IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMembershipTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(['COUNT_BASED', 'DURATION_BASED', 'STORED_VALUE', 'HYBRID'])
  type: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  totalTimes?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  validDays?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  balanceAmount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  storeId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;
}
