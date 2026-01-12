import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiPropertyOptional({ description: '사용자 이메일', example: 'user@example.com' })
  email?: string;

  @ApiPropertyOptional({ description: '표시 이름', example: 'RetroGamer' })
  displayName?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ description: '변경할 표시 이름', example: 'NewGamer' })
  displayName?: string;
}
