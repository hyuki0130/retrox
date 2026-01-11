import { IsInt, IsPositive, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateScoreDto {
  @IsUUID()
  userId: string;

  @IsString()
  @MaxLength(50)
  gameId: string;

  @IsInt()
  @IsPositive()
  score: number;
}
