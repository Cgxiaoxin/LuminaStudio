import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class PurchaseMembershipDto {
  @IsInt()
  @IsNotEmpty()
  clientId: number;

  @IsInt()
  @IsNotEmpty()
  membershipId: number;

  @IsInt()
  @IsOptional()
  storeId?: number;
}
