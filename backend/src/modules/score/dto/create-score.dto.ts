import { IsInt, IsPositive, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateScoreDto {
  @IsUUID()
  declare userId: string;

  @IsString()
  @MaxLength(50)
  declare gameId: string;

  @IsInt()
  @IsPositive()
  declare score: number;
}
