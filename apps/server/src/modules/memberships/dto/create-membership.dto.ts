import { IsString, IsNotEmpty, IsOptional, IsInt, IsEnum, IsDateString, Min } from 'class-validator';

export class CreateMembershipDto {
  @IsInt()
  @IsNotEmpty()
  clientId: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(['COUNT_BASED', 'DURATION_BASED', 'HYBRID'])
  type: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  totalTimes?: number;

  @IsDateString()
  @IsOptional()
  startedAt?: string;

  @IsDateString()
  @IsOptional()
  expiredAt?: string;

  @IsInt()
  @IsOptional()
  storeId?: number;
}
