import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('admin')
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('product')
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.adminService.createProduct(createProductDto);
  }

  @Patch('product/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return await this.adminService.updateProduct(id, updateProductDto);
  }

  @Delete('product/:id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.adminService.removeProduct(id);
  }
}
