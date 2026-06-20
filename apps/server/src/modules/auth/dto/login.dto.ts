import { IsString, IsNotEmpty } from 'class-validator';

export class AdminLoginDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class WeappLoginDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class BindPhoneDto {
  @IsString()
  @IsNotEmpty()
  phone: string;
}

export class BindPhoneCodeDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}
