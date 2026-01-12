import { IsInt, IsPositive, IsString, IsUUID, MaxLength } from 'class-validator';

export class SpendCoinsDto {
  @IsUUID()
  declare userId: string;

  @IsInt()
  @IsPositive()
  declare amount: number;

  @IsString()
  @MaxLength(100)
  declare reason: string;
}
