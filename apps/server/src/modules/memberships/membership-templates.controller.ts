import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { MembershipTemplatesService } from './membership-templates.service';
import { CreateMembershipTemplateDto } from './dto/create-membership-template.dto';
import { RequestWithUser } from '../../common/types/request';
import { Roles, Public } from '../auth/auth.decorator';
import { resolveTenantId } from '../../common/utils/resolve-tenant';

@Controller('membership-templates')
export class MembershipTemplatesController {
  constructor(private templatesService: MembershipTemplatesService) {}

  @Post()
  @Roles('OWNER', 'ADMIN')
  create(@Body() dto: CreateMembershipTemplateDto, @Req() req: RequestWithUser) {
    return this.templatesService.create(dto, req.user.tenantId);
  }

  @Get()
  @Public()
  findAll(
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Req() req?: RequestWithUser,
  ) {
    return this.templatesService.findAll(resolveTenantId(req!), {
      type,
      status: status || 'ACTIVE',
      page,
      limit,
    });
  }

  @Get(':id')
  @Public()
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.templatesService.findOne(id, resolveTenantId(req));
  }

  @Patch(':id')
  @Roles('OWNER', 'ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateMembershipTemplateDto>,
    @Req() req: RequestWithUser,
  ) {
    return this.templatesService.update(id, dto, req.user.tenantId);
  }

  @Delete(':id')
  @Roles('OWNER', 'ADMIN')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.templatesService.remove(id, req.user.tenantId);
  }

  @Post(':id/issue')
  @Roles('OWNER', 'ADMIN', 'STAFF')
  issue(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { clientId: number },
    @Req() req: RequestWithUser,
  ) {
    return this.templatesService.issueFromTemplate(id, body.clientId, req.user.tenantId);
  }

  @Post(':id/purchase')
  purchase(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    if (req.user.type !== 'client') {
      throw new BadRequestException('Only clients can purchase memberships');
    }
    return this.templatesService.purchase(id, req.user.id, req.user.tenantId);
  }
}
