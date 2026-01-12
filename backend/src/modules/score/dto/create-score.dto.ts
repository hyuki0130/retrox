import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateScoreDto {
  @ApiProperty({ description: '사용자 UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  declare userId: string;

  @ApiProperty({ description: '게임 ID', example: 'galaga', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  declare gameId: string;

  @ApiProperty({ description: '획득 점수 (양수)', example: 15000, minimum: 1 })
  @IsInt()
  @IsPositive()
  declare score: number;
}
