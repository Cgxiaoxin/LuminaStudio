import { IsOptional, IsInt, IsDateString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryLedgerDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  storeId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  clientId?: number;

  @IsOptional()
  @IsEnum(['RECHARGE', 'CONSUME', 'WRITE_OFF', 'REFUND', 'ADJUSTMENT'])
  type?: string;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number = 20;
}
