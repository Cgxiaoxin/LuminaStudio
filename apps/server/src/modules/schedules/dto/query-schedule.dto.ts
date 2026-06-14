import { IsOptional, IsInt, IsDateString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ScheduleStatus } from '@prisma/client';

export class QueryScheduleDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  storeId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  coachId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  serviceId?: number;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @IsEnum(['OPEN', 'FULL', 'CANCELED', 'ARCHIVED'])
  status?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number = 20;
}
