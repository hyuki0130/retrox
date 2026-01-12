import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { User } from '@prisma/client';

import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './user.dto';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: '사용자 생성', description: '새로운 사용자를 생성하고 초기 코인을 지급합니다.' })
  @ApiResponse({ status: 201, description: '사용자 생성 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async create(@Body() dto: CreateUserDto): Promise<User> {
    return this.userService.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: '사용자 조회', description: 'ID로 사용자 정보를 조회합니다.' })
  @ApiParam({ name: 'id', description: '사용자 UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: '사용자 정보' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  async findById(@Param('id') id: string): Promise<User> {
    return this.userService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '사용자 정보 수정', description: '사용자의 표시 이름을 수정합니다.' })
  @ApiParam({ name: 'id', description: '사용자 UUID' })
  @ApiResponse({ status: 200, description: '수정된 사용자 정보' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.update(id, dto);
  }

  @Get(':id/coins')
  @ApiOperation({ summary: '사용자 코인 조회', description: '사용자의 현재 코인 잔액을 조회합니다.' })
  @ApiParam({ name: 'id', description: '사용자 UUID' })
  @ApiResponse({ status: 200, description: '코인 잔액', schema: { example: { coins: 10000 } } })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  async getCoins(@Param('id') id: string): Promise<{ coins: number }> {
    const coins = await this.userService.getCoins(id);
    return { coins };
  }
}
