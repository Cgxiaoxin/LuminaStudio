import { IsInt, IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateOrderDto {
  @IsInt()
  @IsNotEmpty()
  bookingId: number;

  @IsInt()
  @IsNotEmpty()
  clientId: number;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  orderType: string;

  @IsInt()
  @IsOptional()
  storeId?: number;
}
