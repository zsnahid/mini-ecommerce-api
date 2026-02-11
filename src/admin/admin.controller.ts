import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Admin')
@ApiBearerAuth('JWT-auth')
@Controller('admin')
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('product')
  @ApiOperation({
    summary: 'Create a new product',
    description: 'Admin only: Creates a new product in the catalog',
  })
  @ApiResponse({
    status: 201,
    description: 'Product successfully created',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.adminService.createProduct(createProductDto);
  }

  @Patch('product/:id')
  @ApiOperation({
    summary: 'Update a product',
    description: 'Admin only: Updates an existing product',
  })
  @ApiParam({ name: 'id', description: 'Product ID', type: 'number' })
  @ApiResponse({ status: 200, description: 'Product successfully updated' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return await this.adminService.updateProduct(id, updateProductDto);
  }

  @Delete('product/:id')
  @ApiOperation({
    summary: 'Delete a product',
    description: 'Admin only: Deletes a product from the catalog',
  })
  @ApiParam({ name: 'id', description: 'Product ID', type: 'number' })
  @ApiResponse({ status: 200, description: 'Product successfully deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.adminService.removeProduct(id);
  }
}
