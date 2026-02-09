import { Controller, Post, Body } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateProductDto } from './dto/create-product.dto';
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
}
