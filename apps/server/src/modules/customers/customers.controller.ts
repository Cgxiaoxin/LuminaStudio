import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, ParseIntPipe } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { RequestWithUser } from '../../common/types/request';
import { Roles, Public } from '../auth/auth.decorator';

@Controller('customers')
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  @Post()
  @Roles('OWNER', 'ADMIN', 'STAFF')
  create(@Body() dto: CreateCustomerDto, @Req() req: RequestWithUser) {
    return this.customersService.create(dto, req.user.tenantId);
  }

  @Get()
  @Roles('OWNER', 'ADMIN', 'STAFF')
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Req() req?: any,
  ) {
    return this.customersService.findAll(req.user.tenantId, { page, limit, search });
  }

  @Get(':id')
  @Roles('OWNER', 'ADMIN', 'STAFF')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.customersService.findOne(id, req.user.tenantId);
  }

  @Patch(':id')
  @Roles('OWNER', 'ADMIN', 'STAFF')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCustomerDto,
    @Req() req: RequestWithUser,
  ) {
    return this.customersService.update(id, dto, req.user.tenantId);
  }

  @Delete(':id')
  @Roles('OWNER', 'ADMIN')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.customersService.remove(id, req.user.tenantId);
  }
}
