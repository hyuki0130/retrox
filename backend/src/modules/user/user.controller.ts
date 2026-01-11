import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { User } from '@prisma/client';

import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() dto: CreateUserDto): Promise<User> {
    return this.userService.create(dto);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<User> {
    return this.userService.findById(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.update(id, dto);
  }

  @Get(':id/coins')
  async getCoins(@Param('id') id: string): Promise<{ coins: number }> {
    const coins = await this.userService.getCoins(id);
    return { coins };
  }
}
