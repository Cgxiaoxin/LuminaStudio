import { IsString, IsNotEmpty, IsOptional, IsNumber, IsInt, IsDateString } from 'class-validator';

export class CreateCouponTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  couponType: string;

  @IsNumber()
  @IsNotEmpty()
  discountValue: number;

  @IsNumber()
  @IsOptional()
  minimumSpend?: number;

  @IsDateString()
  @IsOptional()
  validFrom?: string;

  @IsDateString()
  @IsOptional()
  validTo?: string;

  @IsInt()
  @IsOptional()
  quota?: number;

  @IsInt()
  @IsOptional()
  perUserLimit?: number;
}
