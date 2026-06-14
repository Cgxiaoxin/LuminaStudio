import { IsInt, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsInt()
  @IsNotEmpty()
  orderId: number;

  @IsString()
  @IsNotEmpty()
  channel: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
