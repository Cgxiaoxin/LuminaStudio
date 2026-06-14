import { Controller, Get, Param, Query, Req, ParseIntPipe } from '@nestjs/common';
import { LedgerService } from './ledger.service';
import { QueryLedgerDto } from './dto/query-ledger.dto';
import { RequestWithUser } from '../../common/types/request';
import { Roles } from '../auth/auth.decorator';

@Controller('ledger')
export class LedgerController {
  constructor(private ledgerService: LedgerService) {}

  @Get()
  @Roles('OWNER', 'ADMIN')
  findAll(@Query() query: QueryLedgerDto, @Req() req: RequestWithUser) {
    return this.ledgerService.findAll(req.user.tenantId, query);
  }

  @Get(':id')
  @Roles('OWNER', 'ADMIN')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.ledgerService.findOne(id, req.user.tenantId);
  }
}
