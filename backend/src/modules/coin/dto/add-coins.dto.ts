import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsString, IsUUID, MaxLength } from 'class-validator';

export class AddCoinsDto {
  @ApiProperty({ description: '사용자 UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  declare userId: string;

  @ApiProperty({ description: '지급할 코인 수량 (양수)', example: 800, minimum: 1 })
  @IsInt()
  @IsPositive()
  declare amount: number;

  @ApiProperty({ description: '지급 사유', example: 'ad_reward', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  declare reason: string;
}
