import { IsString, IsOptional, IsInt, Min, IsDateString } from 'class-validator';

export class UpdateScheduleDto {
  @IsInt()
  @IsOptional()
  serviceId?: number;

  @IsInt()
  @IsOptional()
  coachId?: number;

  @IsDateString()
  @IsOptional()
  startAt?: string;

  @IsDateString()
  @IsOptional()
  endAt?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  capacity?: number;

  @IsString()
  @IsOptional()
  note?: string;
}
