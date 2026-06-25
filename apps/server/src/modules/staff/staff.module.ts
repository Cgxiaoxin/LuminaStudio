import { Module } from '@nestjs/common';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { CoachesController } from './coaches.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StaffController, CoachesController],
  providers: [StaffService],
  exports: [StaffService],
})
export class StaffModule {}
