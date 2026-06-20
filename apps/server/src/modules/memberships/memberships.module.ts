import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { MembershipsController } from "./memberships.controller";
import { MembershipsService } from "./memberships.service";
import { MembershipTemplatesController } from "./membership-templates.controller";
import { MembershipTemplatesService } from "./membership-templates.service";

@Module({
  imports: [PrismaModule],
  controllers: [MembershipsController, MembershipTemplatesController],
  providers: [MembershipsService, MembershipTemplatesService],
  exports: [MembershipsService, MembershipTemplatesService],
})
export class MembershipsModule {}
