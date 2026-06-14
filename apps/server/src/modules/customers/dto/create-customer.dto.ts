import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @IsOptional()
  openid?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  nickname?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;
}
