import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, ParseIntPipe } from '@nestjs/common';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { RequestWithUser } from '../../common/types/request';

@Controller('stores')
export class StoresController {
  constructor(private storesService: StoresService) {}

  @Post()
  create(@Body() dto: CreateStoreDto, @Req() req: RequestWithUser) {
    return this.storesService.create(dto, req.user.tenantId);
  }

  @Get()
  findAll(@Query() pagination: PaginationDto, @Req() req: RequestWithUser) {
    return this.storesService.findAll(req.user.tenantId, pagination);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.storesService.findOne(id, req.user.tenantId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStoreDto,
    @Req() req: RequestWithUser,
  ) {
    return this.storesService.update(id, dto, req.user.tenantId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.storesService.remove(id, req.user.tenantId);
  }
}
