import { IsInt, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class CreateBookingDto {
  @IsInt()
  @IsNotEmpty()
  scheduleId: number;

  @IsInt()
  @IsNotEmpty()
  clientId: number;

  @IsInt()
  @IsOptional()
  membershipId?: number;

  @IsEnum(['WECHAT_MINIAPP', 'ADMIN', 'MANUAL'])
  @IsOptional()
  source?: string;
}
