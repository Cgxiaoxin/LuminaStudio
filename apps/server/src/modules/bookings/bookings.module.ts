import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { MembershipsModule } from "../memberships/memberships.module";
import { BookingsController } from "./bookings.controller";
import { BookingsService } from "./bookings.service";

@Module({
  imports: [PrismaModule, MembershipsModule],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
