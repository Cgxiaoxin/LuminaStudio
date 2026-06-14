import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class ConsumeSessionDto {
  @IsInt()
  @Min(1)
  count: number = 1;
}
