import { IsInt, IsPositive, IsString, IsUUID, MaxLength } from 'class-validator';

export class AddCoinsDto {
  @IsUUID()
  userId: string;

  @IsInt()
  @IsPositive()
  amount: number;

  @IsString()
  @MaxLength(100)
  reason: string;
}
